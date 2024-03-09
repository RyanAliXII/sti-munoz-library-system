package repository

type Repositories struct {
	AuthorRepository       AuthorRepositoryInterface
	AuthorNumberRepository AuthorNumberRepositoryInterface
	PublisherRepository    PublisherRepositoryInterface
	SOFRepository          FundSourceRepositoryInterface
	SectionRepository      SectionRepositoryInterface

	DDCRepository         DDCRepositoryInterface
	BookRepository        BookRepositoryInterface
	InventoryRepository   InventoryRepositoryInterface
	ClientRepository      AccountRepositoryInterface

}

func New() *Repositories {

	return &Repositories{
		AuthorRepository:       NewAuthorRepository(),
		PublisherRepository:    NewPublisherRepository(),
		SOFRepository:          NewFundSourceRepository(),
		SectionRepository:      NewSectionRepository(),
		AuthorNumberRepository: NewAuthorNumberRepository(),
		DDCRepository:          NewDDCRepository(),
		BookRepository:         NewBookRepository(),
		InventoryRepository:    NewInventoryRepository(),
		ClientRepository:       NewAccountRepository(),
		 
	}
}
