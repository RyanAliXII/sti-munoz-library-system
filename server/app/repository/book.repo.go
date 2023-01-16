package repository

import (
	"slim-app/server/app/model"
	"slim-app/server/app/pkg/slimlog"

	"github.com/jmoiron/sqlx"
)

type BookRepository struct {
	db *sqlx.DB
}

func (repo *BookRepository) New(book model.Book) error {
	query := `INSERT INTO catalog.book(
		title, isbn, description, copies, pages, section_id, publisher_id, fund_source_id, cost_price, edtion, year_published, received_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`

	_, insertErr := repo.db.Exec(query, book.Title, book.ISBN, book.Description, book.Copies, book.Pages,
		book.SectionId, book.PublisherId, book.FundSourceId, book.CostPrice, book.Edition, book.YearPublished, book.ReceivedAt.Time)
	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function("BookRepository.New"))
	}
	return insertErr
}

func NewBookRepository(db *sqlx.DB) BookRepositoryInterface {

	return &BookRepository{
		db: db,
	}
}

type BookRepositoryInterface interface {
	New(model.Book) error
}
