package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"
	"unicode"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/objstore"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/objstore/utils"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/google/uuid"
	"github.com/jaevor/go-nanoid"
	"github.com/jmoiron/sqlx"
	"github.com/minio/minio-go/v7"
	"go.uber.org/zap"
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
	selectSectionErr := transaction.Get(&section, "SELECT id, accession_table, (case when accession_table = 'accession_main' then false else true end) as has_own_accession from catalog.section where id = $1 ", book.Section.Id)
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

func (repo *BookRepository) NewBookCover(bookId string, covers []*multipart.FileHeader) error {
	ctx := context.Background()
	dialect := goqu.Dialect("postgres")
	canonicID, nanoIdErr := nanoid.Standard(21)
	if nanoIdErr != nil {
		logger.Error(nanoIdErr.Error(), slimlog.Function("BookRepository.UploadBookCover"), slimlog.Error("nanoIdErr"))
		return nanoIdErr
	}
	bookCoverRows := make([]goqu.Record, 0)
	for _, cover := range covers {
		extension := filepath.Ext(cover.Filename)
		objectName := fmt.Sprintf("covers/%s/%s%s", bookId, canonicID(), extension)
		fileBuffer, _ := cover.Open()
		defer fileBuffer.Close()
		contentType := cover.Header["Content-Type"][0]
		fileSize := cover.Size

		info, uploadErr := repo.minio.PutObject(ctx, objstore.BUCKET, objectName, fileBuffer, fileSize, minio.PutObjectOptions{
			ContentType: contentType,
		})
		if uploadErr != nil {
			logger.Error(uploadErr.Error(), slimlog.Function("BookRepository.UploadBookCover"), slimlog.Error("uploadErr"))
			return uploadErr
		}
		bookCoverRows = append(bookCoverRows, goqu.Record{
			"path":    info.Key,
			"book_id": bookId,
		})
		logger.Info("Book cover uploaded.", zap.String("bookId", bookId), zap.String("s3Key", info.Key))

	}
	ds := dialect.From(goqu.T("book_cover").Schema("catalog")).Prepared(true).Insert().Rows(bookCoverRows)

	query, args, _ := ds.ToSQL()

	_, insertCoverErr := repo.db.Exec(query, args...)

	if insertCoverErr != nil {
		logger.Error(insertCoverErr.Error(), slimlog.Function("BookRepository.NewBookCover"), slimlog.Error("insertCoverErr"))
		return insertCoverErr
	}
	return nil
}

func (repo *BookRepository) UpdateBookCover(bookId string, covers []*multipart.FileHeader) error {
	ctx := context.Background()
	dialect := goqu.Dialect("postgres")
	path := fmt.Sprintf("covers/%s/", bookId)
	canonicID, nanoIdErr := nanoid.Standard(21)
	if nanoIdErr != nil {
		logger.Error(nanoIdErr.Error(), slimlog.Function("BookRepository.UpdateBookCover"), slimlog.Error("nanoIdErr"))
		return nanoIdErr
	}
	objects := repo.minio.ListObjects(ctx, objstore.BUCKET, minio.ListObjectsOptions{
		Recursive: true,
		Prefix:    path,
	})
	//map old uploaded book covers.
	oldCoversMap := make(map[string]minio.ObjectInfo)
	for obj := range objects {
		oldCoversMap[obj.Key] = obj
	}
	newCoversMap := make(map[string]*multipart.FileHeader)
	bookCoverRows := make([]goqu.Record, 0)

	//check if book covers are already uploaded. If not, uploud.
	for _, cover := range covers {
		key := fmt.Sprintf("%s%s", path, cover.Filename)
		_, isAlreadyUploaded := oldCoversMap[key]
		if !isAlreadyUploaded {
			extension := filepath.Ext(cover.Filename)
			objectName := fmt.Sprintf("%s%s%s", path, canonicID(), extension)
			fileBuffer, _ := cover.Open()
			defer fileBuffer.Close()
			contentType := cover.Header["Content-Type"][0]
			fileSize := cover.Size

			info, uploadErr := repo.minio.PutObject(ctx, objstore.BUCKET, objectName, fileBuffer, fileSize, minio.PutObjectOptions{
				ContentType: contentType,
			})
			if uploadErr != nil {
				logger.Error(uploadErr.Error(), slimlog.Function("BookRepository.UpdateBookCover"), slimlog.Error("uploadErr"))
				return uploadErr
			}
			//store new cover to be inserted later
			bookCoverRows = append(bookCoverRows, goqu.Record{
				"path":    info.Key,
				"book_id": bookId,
			})
			logger.Info("Book cover uploaded.", zap.String("bookId", bookId), zap.String("s3Key", info.Key))
		}
		newCoversMap[key] = cover
	}
	transaction, transactErr := repo.db.Beginx()

	if transactErr != nil {
		transaction.Rollback()
		return transactErr
	}

	// check if old covers are removed, if removed, delete from object storage
	for _, oldCover := range oldCoversMap {
		key := oldCover.Key
		_, stillExist := newCoversMap[key]
		if !stillExist {
			deleteObjErr := repo.minio.RemoveObject(ctx, objstore.BUCKET, oldCover.Key, minio.RemoveObjectOptions{})
			if deleteObjErr != nil {
				transaction.Rollback()
				logger.Error(deleteObjErr.Error(), slimlog.Function("BookRepository.UpdateBookCover"), slimlog.Error("deleteObjErr"))
				return deleteObjErr
			}
			_, deleteErr := transaction.Exec("Delete from catalog.book_cover where book_id= $1 AND path = $2  ", bookId, key)
			//delete from db
			if deleteErr != nil {
				transaction.Rollback()
				logger.Error(deleteErr.Error(), slimlog.Function("BookRepository.UpdateBookCover"), slimlog.Error("deleteErr"))
				return deleteErr
			}
		}

	}
	// insert new uploaded cover to db.
	insertDs := dialect.From(goqu.T("book_cover").Schema("catalog")).Prepared(true).Insert().Rows(bookCoverRows)
	query, args, _ := insertDs.ToSQL()
	_, insertErr := transaction.Exec(query, args...)

	if insertErr != nil {
		transaction.Rollback()
		logger.Error(insertErr.Error(), slimlog.Function("BookRepository.UpdateBookCover"), slimlog.Error("insertErr"))
		return insertErr
	}
	transaction.Commit()
	return nil
}
func (repo * BookRepository) DeleteBookCoversByBookId(bookId string) error {
	ctx := context.Background()
	path := fmt.Sprintf("covers/%s/", bookId)
	objects := repo.minio.ListObjects(ctx, objstore.BUCKET, minio.ListObjectsOptions{
		Recursive: true,
		Prefix:    path,
	})

	for cover := range objects {
		deleteCoverErr := repo.minio.RemoveObject(ctx, objstore.BUCKET, cover.Key, minio.RemoveObjectOptions{})
		if deleteCoverErr != nil {
			logger.Error(deleteCoverErr.Error(), slimlog.Function("BookRepository.DeleteBookCoversByBookId"), slimlog.Error("deleteCoverErr "))
			return deleteCoverErr
		}
	}
	_, deleteErr := repo.db.Exec("DELETE FROM catalog.book_cover where book_id = $1", bookId)
	if deleteErr != nil {
		logger.Error(deleteErr.Error(), slimlog.Function("BookRepository.DeleteBookCoversByBookId"), slimlog.Error("deleteErr"))
		return deleteErr
	}
	return nil
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
func (repo * BookRepository)ImportBooks(books []model.BookImport, sectionId int) error{
	var bookTitleId string;
	var lastBookTitleId string;
	var lastBookId string
	var maxAccessionNumber int;
	var copyNumber = 1

	var authorStore map[string]string = make(map[string]string)
	var publisherStore map[string]string = map[string]string{}
	dialect := goqu.Dialect("postgres")
	if (len(books) == 0){
			return nil
	}
	transaction, err  := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}
	authorRows := make([]goqu.Record, 0)
	publisherRows := make([]goqu.Record, 0)
	bookRows := make([]goqu.Record, 0)
	bookAuthorRows := make([]goqu.Record, 0)
	accessionRows := make([]goqu.Record, 0)
	for _, book := range books {
		if(book.AccessionNumber > maxAccessionNumber ){
				maxAccessionNumber = book.AccessionNumber
		}
		authorNameTrimmed := strings.TrimSpace(book.Author)
		publisherNameTrimmed := strings.TrimSpace(book.Publisher)
		bookTitleId = strings.Map(func(r rune) rune {
			if(unicode.IsSpace(r)){
					return -1
				}
				return unicode.To(unicode.LowerCase, r)
		}, book.Title)
		if authorNameTrimmed == "" {
			authorNameTrimmed= "Unknown"
		}
		if publisherNameTrimmed == "" {
			publisherNameTrimmed = "Unknown"
		}
		if book.Title ==  ""{
			book.Title = "Untitled"
		}
		

		authorId, isAuthorStored := authorStore[authorNameTrimmed];
		publisherId, isPublisherStored := publisherStore[publisherNameTrimmed]
		if !isAuthorStored {
			err := transaction.Get(&authorId, "SELECT id from catalog.author where name = $1 LIMIT 1", authorNameTrimmed)
			if err != nil  && err != sql.ErrNoRows {
				transaction.Rollback()
				return err
			}
			if len(authorId) == 0 {
				id, err  := uuid.NewUUID()
				if err != nil {
					transaction.Rollback()
					return err
				}
				authorId = id.String()
				authorRows = append(authorRows, goqu.Record{
					"id":  authorId,
					"name": authorNameTrimmed,
				})
				
			}
			authorStore[authorNameTrimmed] = authorId
		}
		if !isPublisherStored {
			err = transaction.Get(&publisherId, "SELECT id from catalog.publisher where name = $1 LIMIT 1", publisherNameTrimmed)
			if err != nil && err != sql.ErrNoRows {
				transaction.Rollback()
				return err
			}
			if len(publisherId) == 0 {
				id, err  := uuid.NewUUID()
				if err != nil {
					transaction.Rollback()
					return err
				}
				publisherId = id.String()
				publisherRows = append(publisherRows, goqu.Record{
					"id":  publisherId,
					"name": publisherNameTrimmed,
				})
			}
			publisherStore[publisherNameTrimmed] = publisherId
		}
		if(bookTitleId != lastBookTitleId){
			id, err := uuid.NewUUID()
			if err != nil {
				transaction.Rollback()
				return err
			}
			lastBookId = id.String()
			copyNumber = 1
			bookRows = append(bookRows, goqu.Record{
				"id": lastBookId,
				"title": book.Title,
				"publisher_id" : publisherId,
				"section_id" :sectionId,
				"year_published": book.YearPublished,
				"ddc": book.DDC,
				"author_number": book.AuthorNumber,
				"edition": book.Edition,
				"cost_price": book.CostPrice,
				"isbn": book.ISBN,
				"source_of_fund": book.SourceOfFund,
			})
			bookAuthorRows = append(bookAuthorRows, goqu.Record{
				"book_id":  lastBookId,
				"author_id": authorId,
			})
		}
		accessionRows = append(accessionRows, goqu.Record{
				"book_id": lastBookId,
				"number" : book.AccessionNumber,
				"copy_number" : copyNumber,
				"section_id" :sectionId,
		})
		copyNumber ++;
		lastBookTitleId = bookTitleId
	 }
	accesionCounter := model.AccessionCounter{}

	err = transaction.Get(&accesionCounter, "SELECT accession, last_value FROM catalog.section INNER JOIN accession.counter on section.accession_table = counter.accession where id = $1", sectionId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	if maxAccessionNumber > accesionCounter.LastValue {
		_, err = transaction.Exec("UPDATE accession.counter set last_value = $1 where accession = $2", maxAccessionNumber, accesionCounter.Accession)
		if err  != nil {
			transaction.Rollback()
		}
	}
	if(len(authorRows) > 0){
		authorDs := dialect.From(goqu.T("author").Schema("catalog")).Prepared(true).Insert().Rows(authorRows)
		query, args, _ := authorDs.ToSQL()
		_, err = transaction.Exec(query, args...)
		if err  != nil {	
			transaction.Rollback()
			return fmt.Errorf("insert authors: %s", err.Error())
		}
	}
	if(len(publisherRows) > 0){
		publisherDs := dialect.From(goqu.T("publisher").Schema("catalog")).Prepared(true).Insert().Rows(publisherRows)
		query, args, _ := publisherDs.ToSQL()
		_, err = transaction.Exec(query, args...)
		if err  != nil {	
			transaction.Rollback()
			return fmt.Errorf("insert publisher: %s", err.Error())
		}
	}
   if(len(bookRows) > 0){
	bookDs := dialect.From(goqu.T("book").Schema("catalog")).Prepared(true).Insert().Rows(bookRows)
	query, args, _ := bookDs.ToSQL()
	_, err = transaction.Exec(query, args...)
	if err  != nil {	
		transaction.Rollback()
		return fmt.Errorf("insert book: %s", err.Error())
	}
   }
	if(len(bookAuthorRows) > 0){
		bookAuthorDs := dialect.From(goqu.T("book_author").Schema("catalog")).Prepared(true).Insert().Rows(bookAuthorRows)
		query, args, _ := bookAuthorDs.ToSQL()
		_, err = transaction.Exec(query, args...)
		if err  != nil {	
			transaction.Rollback()
			return fmt.Errorf("insert book_author: %s", err.Error())
		}
	}
	if(len(accessionRows) > 0){
		accessionDs := dialect.From(goqu.T("accession").Schema("catalog")).Prepared(true).Insert().Rows(accessionRows)
		query, args, _ := accessionDs.ToSQL()
		_, err = transaction.Exec(query, args...)
		if err  != nil {	
			transaction.Rollback()
			return fmt.Errorf("insert accession: %s", err.Error())
		}
	}

   	transaction.Commit()
	return nil
}

func (repo * BookRepository)AddEbook(id string, eBook * multipart.FileHeader) error {
	file, err := eBook.Open()
	if err != nil {
		return err
	}
	defer file.Close()
	contentType := eBook.Header["Content-Type"][0]
	if contentType != "application/pdf" {
		return fmt.Errorf("content type not suppored: %s", contentType)
	}
	nanoid , err := nanoid.Standard(21)
	if err != nil {
		return err
	}
	ctx := context.Background()
	ext := utils.GetFileExtBasedOnContentType(contentType)
	objectName := fmt.Sprintf("ebook/%s%s", nanoid(), ext)
	fileSize := eBook.Size
	result, err := repo.minio.PutObject(ctx, objstore.BUCKET, objectName, file, fileSize, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return err
	}
	_, err = repo.db.Exec("Update catalog.book set ebook = $1 where id = $2", result.Key, id)
	if err != nil {
		return err
	}
	return nil
}
func (repo * BookRepository)GetEbookById(id string, ) (*minio.Object, error) {
	ebookKey := ""
	err := repo.db.Get(&ebookKey, "SELECT ebook from book_view where id = $1", id)
	if err != nil {
	   return nil, err
	}
	ctx := context.Background()
	object, err := repo.minio.GetObject(ctx, objstore.BUCKET, ebookKey, minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}
	
	return object, nil
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
}
