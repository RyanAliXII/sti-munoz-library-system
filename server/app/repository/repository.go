package repository

import (
	"slim-app/server/app/pkg/cutters"

	"github.com/jmoiron/sqlx"
)

type Repositories struct {
	AuthorRepository       AuthorRepositoryInterface
	PublisherRepository    PublisherRepositoryInterface
	SOFRepository          SOFInterface
	CategoryRepository     CategoryRepositoryInterface
	AuthorNumberRepository AuthorNumberRepositoryInterface
}

func NewRepositories(db *sqlx.DB) Repositories {
	return Repositories{
		AuthorRepository:       NewAuthorRepository(db),
		PublisherRepository:    NewPublisherRepository(db),
		SOFRepository:          NewSOFRepository(db),
		CategoryRepository:     NewCategoryRepository(db),
		AuthorNumberRepository: NewAuthorNumberRepository(cutters.NewCuttersTable(), db),
	}
}
