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
		title, isbn, description, copies, pages, section_id, publisher_id, fund_source_id, cost_price, edtion, year_published, received_at, id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);`

	insertBookResult, insertBookErr := tx.Exec(insertBookQuery, book.Title, book.ISBN, book.Description, book.Copies, book.Pages,
		book.SectionId, book.PublisherId, book.FundSourceId, book.CostPrice, book.Edition, book.YearPublished, book.ReceivedAt.Time, book.Id)
	if insertBookErr != nil {
		logger.Error(insertBookErr.Error(), slimlog.Function("BookRepository.New.insertBookErr"))
		return insertBookErr
	}

	var section model.Section
	selectSectionErr := tx.Get(&section, "SELECT  accession_table, (case when accession_table is NULL then false else true end) as has_own_accession from catalog.section where id = $1 ", book.SectionId)
	if selectSectionErr != nil {
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
	var accessionRows []goqu.Record = make([]goqu.Record, 0)
	for i := 0; i < book.Copies; i++ {
		copyNumber := i + 1
		accessionRows = append(accessionRows, goqu.Record{"book_id": book.Id, "copy_number": copyNumber})

	}
	ds := dialect.From(table).Prepared(true).Insert().Rows(accessionRows)
	insertAccessionQuery, args, _ := ds.ToSQL()
	insertAccessionResult, insertAccessionErr := tx.Exec(insertAccessionQuery, args...)

	if insertAccessionErr != nil {
		logger.Error(insertAccessionErr.Error(), slimlog.Function("BookRepository.New.insertAccessionErr"))
		return insertAccessionErr
	}

	tx.Commit()
	insertedBookRows, _ := insertBookResult.RowsAffected()
	insertedAccessionRows, _ := insertAccessionResult.RowsAffected()
	logger.Info("Accession added.", slimlog.Function("BookRepository.New"), slimlog.AffectedRows(insertedAccessionRows))
	logger.Info("Added new book.", slimlog.Function("BookRepository.New"), slimlog.AffectedRows(insertedBookRows))
	return nil
}

func NewBookRepository(db *sqlx.DB) BookRepositoryInterface {

	return &BookRepository{
		db: db,
	}
}

type BookRepositoryInterface interface {
	New(model.Book) error
}
