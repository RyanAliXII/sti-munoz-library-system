package repository

import (
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/filestorage"
	"github.com/jmoiron/sqlx"
	"github.com/minio/minio-go/v7"
)

type Repositories struct {
	AuthorRepository       AuthorRepository
	AuthorNumberRepository AuthorNumberRepository
	PublisherRepository    PublisherRepository
	SOFRepository          FundSourceRepositoryInterface
	SectionRepository      SectionRepository

	DDCRepository         DDCRepository
	BookRepository        BookRepository
	InventoryRepository   InventoryRepository
	AccountRepository    AccountRepository
	RecordMetadataRepository   RecordMetadataRepository
	BagRepository BagRepository
	BorrowingRepository BorrowingRepository
	AccessionRepository AccessionRepository
	SettingsRepository SettingsRepository
	BorrowingQueueRepository BorrowingQueueRepository
	ClientLogRepository ClientLogRepository
	ContentRepository ContentRepository
	ExtrasRepository ExtrasRepository
	ItemRepository ItemRepository
	PenaltyRepository PenaltyRepository
	ReportRepository ReportRepository
	ReservationRepository ReservationRepository
	ScannerAccount ScannerAccountRepository
	TokenRepository TokenRepository
	SearchTagRepository SearchTagRepository
	StatsRepository StatsRepository
	SystemRepository SystemRepository
	TimeSlotRepository TimeSlotRepository
	TimeSlotProfileRepository TimeSlotProfileRepository
	DateSlotRepository DateSlotRepository
	UserRepository UserRepository
	GameRepository GameRepository
	NotificationRepository NotificationRepository
}

func New(db * sqlx.DB, minio * minio.Client, fileStorage filestorage.FileStorage) *Repositories {
	sectionRepo := NewSectionRepository(db);
	settingsRepo := NewSettingsRepository(db)
	return &Repositories{
		AuthorRepository:       NewAuthorRepository(db),
		PublisherRepository:    NewPublisherRepository(db),
		SOFRepository:          NewFundSourceRepository(db),
		SectionRepository: sectionRepo,
		AuthorNumberRepository: NewAuthorNumberRepository(),
		DDCRepository:          NewDDCRepository(db),
		BookRepository:         NewBookRepository(db, sectionRepo, fileStorage),
		InventoryRepository:    NewInventoryRepository(db),
		AccountRepository:       NewAccountRepository(db, fileStorage),
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
		ExtrasRepository:  NewExtrasRepository(db),
		ItemRepository:  NewItemRepository(db),
		PenaltyRepository:  NewPenaltyRepository(db, minio),
		ReportRepository:  NewReportRepository(db),
		ReservationRepository: NewReservationRepository(db),
		ScannerAccount:  NewScannerAccountRepository(db),
		TokenRepository: NewTokenRepository(db),
		SearchTagRepository: NewSearchTagRepository(db),
		StatsRepository: NewStatsRepository(db),
		SystemRepository: NewSystemRepository(db),
		TimeSlotRepository:  NewTimeSlotRepository(db),
		TimeSlotProfileRepository: NewTimeSlotProfileRepository(db),
		DateSlotRepository: NewDateSlotRepository(),
		UserRepository: NewUserRepository(db),
		GameRepository:  NewGameRepository(db),
		NotificationRepository: NewNotificationRepository(db) ,
	}
}
