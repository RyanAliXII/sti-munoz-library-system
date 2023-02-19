package repository

import (
	cutters "slim-app/server/app/pkg/cutters"
	"slim-app/server/app/pkg/postgresdb"
)

type Repositories struct {
	AuthorRepository       AuthorRepositoryInterface
	AuthorNumberRepository AuthorNumberRepositoryInterface
	PublisherRepository    PublisherRepositoryInterface
	SOFRepository          FundSourceRepositoryInterface
	SectionRepository      SectionRepositoryInterface

	DDCRepository         DDCRepositoryInterface
	BookRepository        BookRepositoryInterface
	InventoryRepository   InventoryRepositoryInterface
	ClientRepository      ClientRepositoryInterface
	CirculationRepository CirculationRepositoryInterface
}

func NewRepositories() *Repositories {
	db := postgresdb.GetOrCreateInstance()
	return &Repositories{
		AuthorRepository:       NewAuthorRepository(db),
		PublisherRepository:    NewPublisherRepository(db),
		SOFRepository:          NewFundSourceRepository(db),
		SectionRepository:      NewSectionRepository(db),
		AuthorNumberRepository: NewAuthorNumberRepository(cutters.NewCuttersTable(), db),
		DDCRepository:          NewDDCRepository(db),
		BookRepository:         NewBookRepository(db),
		InventoryRepository:    NewInventoryRepository(db),
		ClientRepository:       NewClientRepository(db),
		CirculationRepository:  NewCirculationRepository(db),
	}
}
