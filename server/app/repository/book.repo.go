package repository

import (
	"fmt"
	"slim-app/server/app/model"
	"slim-app/server/app/pkg/slimlog"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type BookRepository struct {
	db *sqlx.DB
}

func (repo *BookRepository) New(book model.Book) error {

	tx := repo.db.MustBegin()
	id := uuid.New().String()
	book.Id = id
	insertBookQuery := `INSERT INTO catalog.book(
		title, isbn, description, copies, pages, section_id, publisher_id, fund_source_id, cost_price, edition, year_published, received_at, id, author_number, ddc)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);`

	insertBookResult, insertBookErr := tx.Exec(insertBookQuery, book.Title, book.ISBN, book.Description, book.Copies, book.Pages,
		book.SectionId, book.PublisherId, book.FundSourceId, book.CostPrice, book.Edition, book.YearPublished, book.ReceivedAt.Time, book.Id, book.AuthorNumber, book.DDC)
	if insertBookErr != nil {
		logger.Error(insertBookErr.Error(), slimlog.Function("BookRepository.New.insertBookErr"))
		return insertBookErr
	}

	var section model.Section
	selectSectionErr := tx.Get(&section, "SELECT  accession_table, (case when accession_table is NULL then false else true end) as has_own_accession from catalog.section where id = $1 ", book.SectionId)
	if selectSectionErr != nil {
		tx.Rollback()
		logger.Error(selectSectionErr.Error(), slimlog.Function("BookRepository.New.selectSectionErr"))
		return selectSectionErr

	}
	dialect := goqu.Dialect("postgres")
	const DEFAULT_ACCESSION = "default_accession"
	accession := DEFAULT_ACCESSION
	if section.HasOwnAccession {
		accession = string(section.AccessionTable)
	}
	table := fmt.Sprintf("accession.%s", accession)
	// insert book accession.
	var accessionRows []goqu.Record = make([]goqu.Record, 0)
	for i := 0; i < book.Copies; i++ {
		copyNumber := i + 1
		accessionRows = append(accessionRows, goqu.Record{"book_id": book.Id, "copy_number": copyNumber})

	}
	accessionDs := dialect.From(table).Prepared(true).Insert().Rows(accessionRows)
	insertAccessionQuery, accesionArgs, _ := accessionDs.ToSQL()
	insertAccessionResult, insertAccessionErr := tx.Exec(insertAccessionQuery, accesionArgs...)
	fmt.Println(insertAccessionQuery)
	if insertAccessionErr != nil {
		tx.Rollback()
		logger.Error(insertAccessionErr.Error(), slimlog.Function("BookRepository.New.insertAccessionErr"))
		return insertAccessionErr
	}

	insertedBookRows, _ := insertBookResult.RowsAffected()
	insertedAccessionRows, _ := insertAccessionResult.RowsAffected()
	logger.Info("Added new book.", slimlog.Function("BookRepository.New"), slimlog.AffectedRows(insertedBookRows))
	logger.Info("Accession added.", slimlog.Function("BookRepository.New"), slimlog.AffectedRows(insertedAccessionRows))
	//insert authors.
	if len(book.Authors) > 0 {
		var authorRows []goqu.Record = make([]goqu.Record, 0)
		for _, author := range book.Authors {
			authorRows = append(authorRows, goqu.Record{"book_id": book.Id, "author_id": author.Id})
		}
		authorDs := dialect.From("catalog.book_author").Prepared(true).Insert().Rows(authorRows)
		insertAuthorQuery, authorArgs, _ := authorDs.ToSQL()

		insertAuthorResult, insertAuthorErr := tx.Exec(insertAuthorQuery, authorArgs...)

		if insertAuthorErr != nil {
			tx.Rollback()
			logger.Error(insertAuthorErr.Error(), slimlog.Function("BookRepository.New.insertAuthorErr"))
			return insertAuthorErr
		}
		insertedAuthorRows, _ := insertAuthorResult.RowsAffected()
		logger.Info("Author added.", slimlog.Function("BookRepository.New"), slimlog.AffectedRows(insertedAuthorRows))

	}
	tx.Commit()
	return nil
}

func (repo *BookRepository) Get() []model.BookGet {
	var books []model.BookGet = make([]model.BookGet, 0)
	query := `
	SELECT book.id,title, isbn, 
	description, 
	copies,
	pages,
	section_id,  
	section.name as section,
	publisher.name as publisher,
	fund_source_id,
	source_of_fund.name as fund_source,
	cost_price,
	edition,
	year_published,
	received_at,
	ddc,
	author_number,
	book.created_at,
	(SELECT  json_agg(json_build_object( 'id', author.id, 'given_name', author.given_name , 'middle_name', author.middle_name,  'surname', author.surname )) 
	as authors
	FROM catalog.book_author
	INNER JOIN catalog.author on book_author.author_id = catalog.author.id
	where book_id = book.id
	group by book_id  ) as authors,
	(SELECT find_accession_json(section.accession_table,book.id)) as accessions
	 FROM catalog.book 
	INNER JOIN catalog.section on book.section_id = section.id
	INNER JOIN catalog.publisher on book.publisher_id = publisher.id
	INNER JOIN catalog.source_of_fund on book.fund_source_id = source_of_fund.id
	`
	selectErr := repo.db.Select(&books, query)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("BookRepostory.Get.SelectErr"))
	}
	return books
}

func NewBookRepository(db *sqlx.DB) BookRepositoryInterface {

	return &BookRepository{
		db: db,
	}
}

type BookRepositoryInterface interface {
	New(model.Book) error
	Get() []model.BookGet
}
