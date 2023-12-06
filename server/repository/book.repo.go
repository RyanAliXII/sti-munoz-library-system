package repository

import (
	"errors"
	"fmt"
	"mime/multipart"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/objstore"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/minio/minio-go/v7"
)

type BookRepository struct {
	db                *sqlx.DB
	sectionRepository SectionRepositoryInterface
	minio             *minio.Client
}

func (repo *BookRepository) New(book model.Book) (string, error) {
	
	id := uuid.New().String()
	book.Id = id
	transaction, transactErr := repo.db.Beginx()
	if transactErr != nil {
		logger.Error(transactErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("transactErr"))
		return book.Id, transactErr
	}

	insertBookQuery := `INSERT INTO catalog.book(
		title, isbn, description,  pages, section_id, publisher_id, cost_price, edition, year_published, received_at, id, author_number, ddc, subject)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);`

	insertBookResult, insertBookErr := transaction.Exec(insertBookQuery, book.Title, book.ISBN, book.Description, book.Pages,
		book.Section.Id, book.Publisher.Id, book.CostPrice, book.Edition, book.YearPublished, book.ReceivedAt, book.Id, book.AuthorNumber, book.DDC, book.Subject)
	if insertBookErr != nil {
		logger.Error(insertBookErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("insertBookErr"))
		return book.Id, insertBookErr
	}

	var section model.Section
	selectSectionErr := transaction.Get(&section, "SELECT id, accession_table from catalog.section where id = $1 ", book.Section.Id)
	if selectSectionErr != nil {
		transaction.Rollback()
		logger.Error(selectSectionErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("selectSectionErr"))
		return book.Id, selectSectionErr

	}
	dialect := goqu.Dialect("postgres")

	// insert book accession.
	var accessionRows []goqu.Record = make([]goqu.Record, 0)
	for i := 0; i < book.Copies; i++ {
		copyNumber := i + 1
		accessionRows = append(accessionRows, goqu.Record{"number": goqu.L(fmt.Sprintf("get_next_id('%s')", section.AccessionTable)), "book_id": book.Id, "copy_number": copyNumber, "section_id": section.Id})

	}
	accessionDs := dialect.From(goqu.T("accession").Schema("catalog")).Prepared(true).Insert().Rows(accessionRows)
	insertAccessionQuery, accesionArgs, _ := accessionDs.ToSQL()
	insertAccessionResult, insertAccessionErr := transaction.Exec(insertAccessionQuery, accesionArgs...)

	if insertAccessionErr != nil {
		transaction.Rollback()
		logger.Error(insertAccessionErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("insertAccessionErr"))
		return book.Id, insertAccessionErr
	}

	insertedBookRows, _ := insertBookResult.RowsAffected()
	insertedAccessionRows, _ := insertAccessionResult.RowsAffected()
	logger.Info("Added new book.", slimlog.Function("BookRepository.New"), slimlog.AffectedRows(insertedBookRows))
	logger.Info("model.Accession added.", slimlog.Function("BookRepository.New"), slimlog.AffectedRows(insertedAccessionRows))

	if len(book.Authors) > 0 {
		rows := make([]goqu.Record, 0)

		for _, p := range book.Authors{
			rows = append(rows, goqu.Record{"book_id": book.Id, "author_id": p.Id})
		}
		ds := dialect.From("catalog.book_author").Prepared(true).Insert().Rows(rows)
		query, args, _ := ds.ToSQL()

		_, insertAuthorErr := transaction.Exec(query, args...)
		if insertAuthorErr != nil {
			transaction.Rollback()
			logger.Error(insertAuthorErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("error at insert people"))
			return book.Id, insertAuthorErr
		}
	}
	if len(book.SearchTags) > 0 {
		rows := make([]goqu.Record, 0)
		for _, tag := range book.SearchTags {
			rows = append(rows, goqu.Record{"book_id": book.Id, "name": tag})
		}
		ds := dialect.From("catalog.search_tag").Prepared(true).Insert().Rows(rows)
		query, args, _ := ds.ToSQL()
		_, insertTagsErr:= transaction.Exec(query, args...)
		if insertTagsErr != nil {
			transaction.Rollback()
			logger.Error(insertTagsErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("insertTagsErr"))
			return book.Id, insertTagsErr
		}
	}

	transaction.Commit()
	return book.Id, nil
}

func (repo *BookRepository) Get(filter filter.Filter) []model.Book {
	var books []model.Book = make([]model.Book, 0)
	query := `SELECT id, 
	title, 
	isbn, 
	description, 
	copies,
	subject, 
	ebook,
	accession_table,
	pages,
	cost_price,
	edition,
	search_tags,
	year_published, 
	received_at, 
	ddc, 
	author_number, 
	created_at, 
	section, publisher, authors, accessions, covers FROM book_view
	ORDER BY created_at DESC LIMIT $1  OFFSET $2`
	selectErr := repo.db.Select(&books, query, filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("BookRepostory.Get"), slimlog.Error("SelectErr"))
	}
	return books
}
func (repo *BookRepository) GetClientBookView(filter filter.Filter) []model.Book {
	var books []model.Book = make([]model.Book, 0)
	query := `SELECT id, 
	title, 
	isbn, 
	description, 
	copies,
	subject, 
	pages,
	edition,
	year_published, 
	received_at,
	ebook, 
	ddc, 
	author_number, 
	created_at, 
	section, publisher, authors, accessions, covers FROM client_book_view
	ORDER BY created_at DESC LIMIT $1  OFFSET $2`
	selectErr := repo.db.Select(&books, query, filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("BookRepostory.GetClientBookView"), slimlog.Error("SelectErr"))
	}
	return books
}
func (repo *BookRepository) GetOne(id string) model.Book {
	var book model.Book = model.Book{}
	query := `SELECT id, 
	title, 
	isbn,
	subject,
	search_tags,
	ebook, 
	description, 
	copies, pages,
	cost_price,
	accession_table,
	edition,
	year_published, 
	received_at, 
	ddc, 
	author_number, 
	created_at, 
	section, publisher, authors, accessions, covers FROM book_view
	where id = $1 ORDER BY created_at DESC`
	selectErr := repo.db.Get(&book, query, id)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("BookRepostory.GetOne"), slimlog.Error("SelectErr"))
	}
	return book
}
func (repo *BookRepository) GetOneOnClientView(id string) model.Book {
	var book model.Book = model.Book{}
	query := `SELECT id, 
	title, 
	isbn,
	subject,
	search_tags, 
	description, 
	copies, pages,
	cost_price,
	edition,
	ebook, 
	year_published, 
	received_at, 
	ddc, 
	author_number, 
	created_at, 
	section, publisher, authors, accessions, covers FROM client_book_view
	where id = $1 ORDER BY created_at DESC`
	selectErr := repo.db.Get(&book, query, id)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("BookRepostory.GetOneOnClientView"), slimlog.Error("SelectErr"))
	}
	return book
}

func (repo *BookRepository) Update(book model.Book) error {
	oldBookRecord := repo.GetOne(book.Id)
	if len(oldBookRecord.Id) == 0 {
		return errors.New("book cannot be updated because book doesn't exist")
	}
	transaction, transactErr := repo.db.Beginx()
	dialect := goqu.Dialect("postgres")
	if transactErr != nil {
		transaction.Rollback()
		logger.Error(transactErr.Error(), slimlog.Function("BookRepository.Update"), slimlog.Error("transactErr"))
		return transactErr
	}

	updateBookQuery := `UPDATE catalog.book SET title = $1,  isbn = $2, description = $3, pages = $4, section_id = $5, publisher_id = $6,
	 cost_price= $7, edition = $8, year_published = $9, received_at = $10, author_number = $11, ddc = $12, subject = $13 where id = $14`

	//update book
	updateResult, updateErr := transaction.Exec(updateBookQuery, book.Title, book.ISBN, book.Description, book.Pages, book.Section.Id, book.Publisher.Id,
		book.CostPrice, book.Edition, book.YearPublished, book.ReceivedAt, book.AuthorNumber, book.DDC, book.Subject, book.Id)
	if updateErr != nil {
		transaction.Rollback()
		logger.Error(updateErr.Error(), slimlog.Function("BookRepository.Update"), slimlog.Error("updateErr"))
		return updateErr
	}
	_, deleteAuthorErr:= transaction.Exec("DELETE FROM catalog.book_author where book_id = $1", book.Id)

	if deleteAuthorErr != nil{
		transaction.Rollback()
		deleteErr := errors.New("a problem has been encountered while deleting authors")
		logger.Error(deleteErr.Error(), slimlog.Function("BookRepository.Update"), slimlog.Error("deleteErr"))
		return deleteErr
	}
	_, deleteSearchTagsErr := transaction.Exec("DELETE FROM catalog.search_tag where book_id = $1 ", book.Id)
	if deleteSearchTagsErr != nil {
		transaction.Rollback()
		logger.Error(deleteSearchTagsErr.Error(), slimlog.Function("BookRepository.Update"), slimlog.Error("deleteErr"))
		return deleteSearchTagsErr
	}
	if len(book.Authors) > 0 {
		rows := make([]goqu.Record, 0)

		for _, p := range book.Authors {
			rows = append(rows, goqu.Record{"book_id": book.Id, "author_id": p.Id})
		}
		ds := dialect.From("catalog.book_author").Prepared(true).Insert().Rows(rows)
		query, args, _ := ds.ToSQL()

		_, insertAuthorErr := transaction.Exec(query, args...)
		if insertAuthorErr != nil {
			transaction.Rollback()
			logger.Error(insertAuthorErr.Error(), slimlog.Function("BookRepository.Update"), slimlog.Error("insertAuthorErr"))
			return insertAuthorErr
		}
	}
	if len(book.SearchTags) > 0 {
		rows := make([]goqu.Record, 0)
		for _, tag := range book.SearchTags {
			rows = append(rows, goqu.Record{"book_id": book.Id, "name": tag})
		}
		ds := dialect.From("catalog.search_tag").Prepared(true).Insert().Rows(rows)
		query, args, _ := ds.ToSQL()
		_, insertTagsErr:= transaction.Exec(query, args...)
		if insertTagsErr != nil {
			transaction.Rollback()
			logger.Error(insertTagsErr.Error(), slimlog.Function("BookRepository.Update"), slimlog.Error("insertTagsErr"))
			return insertTagsErr
		}
	}
	
	updatedBookRows, _ := updateResult.RowsAffected()
	logger.Info("Book updated.", slimlog.AffectedRows(updatedBookRows))

	transaction.Commit()
	return nil
}
func (repo *BookRepository) Search(filter filter.Filter) []model.Book {
	var books []model.Book = make([]model.Book, 0)
	query := `
	SELECT id, 
	title, 
	isbn, 
	description, 
	pages,
	accession_table,
	ebook,
	copies,
	cost_price,
	edition,
	year_published, 
	received_at, 
	ddc, 
	author_number, 
	created_at, 
	section, publisher, authors, accessions, covers FROM book_view
	WHERE search_vector @@ websearch_to_tsquery('english', $1) 
	OR search_vector @@ plainto_tsquery('simple', $1) 
	OR search_tag_vector @@ websearch_to_tsquery('english', $1) 
	OR search_tag_vector @@ plainto_tsquery('simple', $1)
	ORDER BY created_at DESC
	LIMIT $2 OFFSET $3
	`

	selectErr := repo.db.Select(&books, query, filter.Keyword, filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("BookRepository.Search"), slimlog.Error("selectErr"))
	}
	return books
}
func (repo *BookRepository) SearchClientView(filter filter.Filter) []model.Book {
	var books []model.Book = make([]model.Book, 0)
	query := `
	SELECT id, 
	title, 
	isbn, 
	description, 
	pages,
	copies,
	cost_price,
	edition,
	year_published,
	ebook, 
	received_at, 
	ddc, 
	author_number, 
	created_at, 
	section, publisher, authors, accessions, covers FROM client_book_view
	WHERE search_vector @@ websearch_to_tsquery('english', $1) 
	OR search_vector @@ plainto_tsquery('simple', $1) 
	OR search_tag_vector @@ websearch_to_tsquery('english', $1) 
	OR search_tag_vector @@ plainto_tsquery('simple', $1)
	ORDER BY created_at DESC
	LIMIT $2 OFFSET $3
	`

	selectErr := repo.db.Select(&books, query, filter.Keyword, filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("BookRepository.Search"), slimlog.Error("selectErr"))
	}
	return books
}


func (repo * BookRepository)AddBookCopies(id string, copies int) error{
	if copies == 0 { 
		return nil
	}
	transaction, err := repo.db.Beginx()
	if err != nil{ 
		transaction.Rollback()
		return err
	}
	book := model.Book{}
	err = transaction.Get(&book, "SELECT section, copies FROM book_view where id = $1", id)
	if err  != nil{
		transaction.Rollback()
		return err
	}
	dialect := goqu.Dialect("postgres")
	var accessionRows []goqu.Record = make([]goqu.Record, 0)
	for i := 0; i < copies; i++{
			book.Copies++
			accessionRows = append(accessionRows, goqu.Record{"number": goqu.L(fmt.Sprintf("get_next_id('%s')", book.Section.AccessionTable)), "book_id": id, "copy_number": book.Copies, "section_id": book.Section.Id})
	}
	accessionDs := dialect.From(goqu.T("accession").Schema("catalog")).Prepared(true).Insert().Rows(accessionRows)
	insertAccessionQuery, accesionArgs, _ := accessionDs.ToSQL()
	_, insertAccessionErr := transaction.Exec(insertAccessionQuery, accesionArgs...)
	if insertAccessionErr != nil {
		transaction.Rollback()
		return insertAccessionErr
	}
	transaction.Commit()
	return nil
}

func NewBookRepository() BookRepositoryInterface {
	return &BookRepository{
		db:                postgresdb.GetOrCreateInstance(),
		sectionRepository: NewSectionRepository(),
		minio:             objstore.GetorCreateInstance(),
	}
}

type BookRepositoryInterface interface {
	New(model.Book) (string, error)
	Get(filter filter.Filter) []model.Book
	GetOne(id string) model.Book
	Update(model.Book) error
	Search(filter.Filter) []model.Book
	NewBookCover(bookId string, covers []*multipart.FileHeader) error
	UpdateBookCover(bookId string, covers []*multipart.FileHeader) error
	AddBookCopies(id string, copies int) error
	DeleteBookCoversByBookId(bookId string) error 
	ImportBooks(books []model.BookImport, sectionId int) error
	GetClientBookView(filter filter.Filter) []model.Book
	SearchClientView(filter filter.Filter) []model.Book
	GetOneOnClientView(id string) model.Book
	AddEbook(id string, eBook * multipart.FileHeader) error
	GetEbookById(id string, ) (*minio.Object, error)
	RemoveEbookById(id string, ) error
	UpdateEbookByBookId(id string,  eBook * multipart.FileHeader) error
}
