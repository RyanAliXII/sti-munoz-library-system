package services

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/filestorage"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/rabbitmq"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/jmoiron/sqlx"
	"github.com/minio/minio-go/v7"
	"go.uber.org/zap"
)

type Services struct {
	Notification  NotificationService;
	Repos * repository.Repositories
	ClientLogExport ClientLogExporter
	BorrowedBookExport BorrowedBookExporter
	Logger * zap.Logger
	PenaltyExport PenaltyExporter
	Broadcaster Broadcaster
	FileStorage filestorage.FileStorage
	BookCoverService BookCoverService
}
type ServicesDependency struct {
	Db * sqlx.DB
	Minio * minio.Client
	RabbitMQ * rabbitmq.RabbitMQ
	FileStorage  filestorage.FileStorage
}
func BuildServices (deps * ServicesDependency) Services {

	return Services{
		Notification: NewNotificationService(),
		Repos: repository.New(deps.Db, deps.Minio, deps.FileStorage),
		ClientLogExport: NewClienLogExporter(),
		BorrowedBookExport: NewBorrowedBookExporter(),
		Logger: slimlog.GetInstance(),
		Broadcaster: NewRabbitMQBroadcast(deps.RabbitMQ),
		PenaltyExport: NewPenaltyExporter(),
		FileStorage:  GetOrCreateS3FileStorage(),
		BookCoverService: NewBookCoverService(s3FileStorage),
	}
}
