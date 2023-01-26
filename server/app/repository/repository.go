package repository

import (
	"fmt"
	"slim-app/server/app/pkg/cutters"
	"slim-app/server/app/pkg/slimlog"

	"github.com/jmoiron/sqlx"
)

type Repositories struct {
	AuthorRepository       AuthorRepositoryInterface
	PublisherRepository    PublisherRepositoryInterface
	SOFRepository          SOFInterface
	SectionRepository      SectionRepositoryInterface
	AuthorNumberRepository AuthorNumberRepositoryInterface
	DDCRepository          DDCRepositoryInterface
	BookRepository         BookRepositoryInterface
	InventoryRepository    InventoryRepositoryInterface
}

func NewRepositories(db *sqlx.DB) Repositories {
	return Repositories{
		AuthorRepository:       NewAuthorRepository(db),
		PublisherRepository:    NewPublisherRepository(db),
		SOFRepository:          NewSOFRepository(db),
		SectionRepository:      NewCategoryRepository(db),
		AuthorNumberRepository: NewAuthorNumberRepository(cutters.NewCuttersTable(), db),
		DDCRepository:          NewDDCRepository(db),
		BookRepository:         NewBookRepository(db),
		InventoryRepository:    NewInventoryRepository(db),
	}
}

type Repository[model any] struct {
	db    *sqlx.DB
	table string
}

func (repo *Repository[model]) Get() []model {

	var data []model = make([]model, 0)
	selectErr := repo.db.Select(&data, fmt.Sprintf("SELECT * FROM %s where deleted_at IS NULL", repo.table))
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function(GET_AUTHORS))
	}
	return data
}

type RepositoryInterface[model any] interface {
	Get() []model
}
