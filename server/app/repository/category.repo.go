package repository

import (
	"fmt"
	"slim-app/server/app/model"
	"slim-app/server/app/pkg/slimlog"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type CategoryRepository struct {
	db *sqlx.DB
}

func (repo *CategoryRepository) New(category model.Category) error {
	var query string = fmt.Sprintf(`
		CREATE TABLE category.%s(
			id integer primary key generated always as identity,
			book_id uuid,
			copy_number int,
			date_received date,
			source_of_fund_id int,
			created_at timestamptz DEFAULT NOW(),
			deleted_at timestamptz,
			weeded_at timestamptz,
			FOREIGN KEY(source_of_fund_id) REFERENCES book.source_of_funds(id),
			FOREIGN KEY(book_id) REFERENCES book.books(id)
		)
	`, category.Name)
	_, createErr := repo.db.Exec(query)
	if createErr != nil {
		logger.Error(createErr.Error(), slimlog.Function("categoryrepo"), zap.String("error", "prepareERror"))
	}
	return createErr
}
func (repo *CategoryRepository) Get() []model.Category {
	var categories []model.Category = make([]model.Category, 0)
	selectErr := repo.db.Select(&categories, "SELECT table_name as name FROM information_schema.tables WHERE table_schema = 'category'")
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("categoryrepo.Get"))
	}
	return categories
}

func NewCategoryRepository(db *sqlx.DB) CategoryRepositoryInterface {
	return &CategoryRepository{
		db: db,
	}
}

type CategoryRepositoryInterface interface {
	New(category model.Category) error
	Get() []model.Category
}
