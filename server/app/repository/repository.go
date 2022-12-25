package repository

import "github.com/jmoiron/sqlx"

type Repositories struct {
	AuthorRepository    AuthorRepositoryInterface
	PublisherRepository PublisherRepositoryInterface
	SOFRepository       SOFInterface
	CategoryRepository  CategoryRepositoryInterface
}

func NewRepositories(db *sqlx.DB) Repositories {
	return Repositories{
		AuthorRepository:    NewAuthorRepository(db),
		PublisherRepository: NewPublisherRepository(db),
		SOFRepository:       NewSOFRepository(db),
		CategoryRepository:  NewCategoryRepository(db),
	}
}
