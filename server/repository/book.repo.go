package repository

import (
	"context"
	"errors"
	"fmt"
	"mime/multipart"
	"path/filepath"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/objstore"
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
		title, isbn, description, copies, pages, section_id, publisher_id, fund_source_id, cost_price, edition, year_published, received_at, id, author_number, ddc)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);`

	insertBookResult, insertBookErr := transaction.Exec(insertBookQuery, book.Title, book.ISBN, book.Description, book.Copies, book.Pages,
		book.Section.Id, book.Publisher.Id, book.FundSource.Id, book.CostPrice, book.Edition, book.YearPublished, book.ReceivedAt.Time, book.Id, book.AuthorNumber, book.DDC)
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

	if len(book.Authors.People) > 0 {
		rows := make([]goqu.Record, 0)

		for _, p := range book.Authors.People {
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

	if len(book.Authors.Organizations) > 0 {
		rows := make([]goqu.Record, 0)

		for _, org := range book.Authors.Organizations {
			rows = append(rows, goqu.Record{"book_id": book.Id, "org_id": org.Id})
		}
		ds := dialect.From("catalog.org_book_author").Prepared(true).Insert().Rows(rows)
		query, args, _ := ds.ToSQL()

		_, insertAuthorErr := transaction.Exec(query, args...)
		if insertAuthorErr != nil {
			transaction.Rollback()
			logger.Error(insertAuthorErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("error at insert orgs"))
			return book.Id, insertAuthorErr
		}
	}
	if len(book.Authors.Publishers) > 0 {
		rows := make([]goqu.Record, 0)

		for _, publisher := range book.Authors.Publishers {
			rows = append(rows, goqu.Record{"book_id": book.Id, "publisher_id": publisher.Id})
		}
		ds := dialect.From("catalog.publisher_book_author").Prepared(true).Insert().Rows(rows)
		query, args, _ := ds.ToSQL()

		_, insertAuthorErr := transaction.Exec(query, args...)
		if insertAuthorErr != nil {
			transaction.Rollback()
			logger.Error(insertAuthorErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("error at insert publisher"))
			return book.Id, insertAuthorErr
		}
	}

	transaction.Commit()
	return book.Id, nil
}

func (repo *BookRepository) Get() []model.Book {
	var books []model.Book = make([]model.Book, 0)
	query := `SELECT id, 
	title, 
	isbn, 
	description, 
	copies, pages,
	cost_price,
	edition,
	year_published, 
	received_at, 
	ddc, 
	author_number, 
	created_at, 
	fund_source, section, publisher, authors, accessions, covers FROM book_view
	ORDER BY created_at DESC`
	selectErr := repo.db.Select(&books, query)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("BookRepostory.Get"), slimlog.Error("SelectErr"))
	}
	return books
}
func (repo *BookRepository) GetOne(id string) model.Book {
	var book model.Book = model.Book{}
	query := `SELECT id, 
	title, 
	isbn, 
	description, 
	copies, pages,
	cost_price,
	edition,
	year_published, 
	received_at, 
	ddc, 
	author_number, 
	created_at, 
	fund_source, section, publisher, authors, accessions, covers FROM book_view
	 where id = $1 ORDER BY created_at DESC`
	selectErr := repo.db.Get(&book, query, id)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("BookRepostory.GetOne"), slimlog.Error("SelectErr"))
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
	fund_source_id = $7, cost_price= $8, edition = $9, year_published = $10, received_at = $11, author_number = $12, ddc = $13 where id = $14 `

	//update book
	updateResult, updateErr := transaction.Exec(updateBookQuery, book.Title, book.ISBN, book.Description, book.Pages, book.Section.Id, book.Publisher.Id, book.FundSource.Id,
		book.CostPrice, book.Edition, book.YearPublished, book.ReceivedAt, book.AuthorNumber, book.DDC, book.Id)
	if updateErr != nil {
		transaction.Rollback()
		logger.Error(updateErr.Error(), slimlog.Function("BookRepository.Update"), slimlog.Error("updateErr"))
		return updateErr
	}
	_, deletePersonAsAuthorErr := transaction.Exec("DELETE FROM catalog.book_author where book_id = $1", book.Id)
	_, deleteOrgAsAuthorErr := transaction.Exec("DELETE FROM catalog.org_book_author where book_id = $1", book.Id)
	_, deletePublisherAsAuthorErr := transaction.Exec("DELETE FROM catalog.publisher_book_author where book_id = $1", book.Id)
	if deletePersonAsAuthorErr != nil || deleteOrgAsAuthorErr != nil || deletePublisherAsAuthorErr != deletePublisherAsAuthorErr {
		transaction.Rollback()
		deleteErr := errors.New("a problem has been encountered while deleting authors")
		logger.Error(deleteErr.Error(), slimlog.Function("BookRepository.Update"), slimlog.Error("deleteErr"))
		return deleteErr
	}

	if len(book.Authors.People) > 0 {
		rows := make([]goqu.Record, 0)

		for _, p := range book.Authors.People {
			rows = append(rows, goqu.Record{"book_id": book.Id, "author_id": p.Id})
		}
		ds := dialect.From("catalog.book_author").Prepared(true).Insert().Rows(rows)
		query, args, _ := ds.ToSQL()

		_, insertAuthorErr := transaction.Exec(query, args...)
		if insertAuthorErr != nil {
			transaction.Rollback()
			logger.Error(insertAuthorErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("error at insert people"))
			return insertAuthorErr
		}
	}

	if len(book.Authors.Organizations) > 0 {
		rows := make([]goqu.Record, 0)

		for _, org := range book.Authors.Organizations {
			rows = append(rows, goqu.Record{"book_id": book.Id, "org_id": org.Id})
		}
		ds := dialect.From("catalog.org_book_author").Prepared(true).Insert().Rows(rows)
		query, args, _ := ds.ToSQL()

		_, insertAuthorErr := transaction.Exec(query, args...)
		if insertAuthorErr != nil {
			transaction.Rollback()
			logger.Error(insertAuthorErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("error at insert orgs"))
			return insertAuthorErr
		}
	}
	if len(book.Authors.Publishers) > 0 {
		rows := make([]goqu.Record, 0)

		for _, publisher := range book.Authors.Publishers {
			rows = append(rows, goqu.Record{"book_id": book.Id, "publisher_id": publisher.Id})
		}
		ds := dialect.From("catalog.publisher_book_author").Prepared(true).Insert().Rows(rows)
		query, args, _ := ds.ToSQL()

		_, insertAuthorErr := transaction.Exec(query, args...)
		if insertAuthorErr != nil {
			transaction.Rollback()
			logger.Error(insertAuthorErr.Error(), slimlog.Function("BookRepository.New"), slimlog.Error("error at insert publisher"))
			return insertAuthorErr
		}
	}

	updatedBookRows, _ := updateResult.RowsAffected()
	logger.Info("Book updated.", slimlog.AffectedRows(updatedBookRows))

	transaction.Commit()
	return nil
}
func (repo *BookRepository) Search(filter Filter) []model.Book {
	var books []model.Book = make([]model.Book, 0)
	query := `
	SELECT id, 
	title, 
	isbn, 
	description, 
	copies, pages,
	cost_price,
	edition,
	year_published, 
	received_at, 
	ddc, 
	author_number, 
	created_at, 
	fund_source, section, publisher, authors, accessions, covers FROM book_view
	WHERE search_vector @@ websearch_to_tsquery('english', $1) OR search_vector @@ plainto_tsquery('simple', $1)
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
func NewBookRepository() BookRepositoryInterface {
	return &BookRepository{
		db:                postgresdb.GetOrCreateInstance(),
		sectionRepository: NewSectionRepository(),
		minio:             objstore.GetorCreateInstance(),
	}
}

type BookRepositoryInterface interface {
	New(model.Book) (string, error)
	Get() []model.Book
	GetOne(id string) model.Book
	Update(model.Book) error
	Search(Filter) []model.Book
	NewBookCover(bookId string, covers []*multipart.FileHeader) error
	UpdateBookCover(bookId string, covers []*multipart.FileHeader) error
	DeleteBookCoversByBookId(bookId string) error 

}
