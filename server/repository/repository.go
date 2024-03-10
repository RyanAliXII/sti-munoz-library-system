package repository

import (
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/minio/minio-go/v7"
)

type Repositories struct {
	AuthorRepository       AuthorRepositoryInterface
	AuthorNumberRepository AuthorNumberRepositoryInterface
	PublisherRepository    PublisherRepositoryInterface
	SOFRepository          FundSourceRepositoryInterface
	SectionRepository      SectionRepository

	DDCRepository         DDCRepositoryInterface
	BookRepository        BookRepository
	InventoryRepository   InventoryRepositoryInterface
	AccountRepository    AccountRepositoryInterface
	RecordMetadataRepository   RecordMetadataRepository
	BagRepository BagRepository
	BorrowingRepository BorrowingRepository
	AccessionRepository AccessionRepository
	SettingsRepository SettingsRepository
	BorrowingQueueRepository BorrowingQueueRepository
	ClientLogRepository ClientLogRepository
	ContentRepository ContentRepository
}

func New(db * sqlx.DB, minio * minio.Client) *Repositories {
	sectionRepo := NewSectionRepository(db);
	settingsRepo := NewSettingsRepository(db)
	return &Repositories{
		AuthorRepository:       NewAuthorRepository(db),
		PublisherRepository:    NewPublisherRepository(db),
		SOFRepository:          NewFundSourceRepository(db),
		SectionRepository: sectionRepo,
		AuthorNumberRepository: NewAuthorNumberRepository(),
		DDCRepository:          NewDDCRepository(db),
		BookRepository:         NewBookRepository(db, minio, sectionRepo),
		InventoryRepository:    NewInventoryRepository(db),
		AccountRepository:       NewAccountRepository(db, minio),
		RecordMetadataRepository: NewRecordMetadataRepository(db, RecordMetadataConfig{
			CacheExpiration: 5 * time.Minute,
		}),
		BagRepository: NewBagRepository(db, settingsRepo),
		BorrowingRepository: NewBorrowingRepository(db),
		AccessionRepository: NewAccessionRepository(db) ,
		SettingsRepository:  settingsRepo,
		BorrowingQueueRepository: NewBorrowingQueueRepository(db),
		ClientLogRepository:  NewClientLogRepository(db),
		ContentRepository: NewContentRepository(minio),
	}
}
