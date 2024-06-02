package services

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/filestorage"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/minioclient"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/rabbitmq"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
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
}
func BuildServices () Services {
	minioclient := minioclient.GetorCreateInstance()
	db := postgresdb.GetOrCreateInstance()
	rabbitmq := rabbitmq.CreateOrGetInstance()
	fileStorage := GetOrCreateS3FileStorage()
	return Services{
		Notification: NewNotificationService(),
		Repos: repository.New(db, minioclient, fileStorage),
		ClientLogExport: NewClienLogExporter(),
		BorrowedBookExport: NewBorrowedBookExporter(),
		Logger: slimlog.GetInstance(),
		Broadcaster: NewRabbitMQBroadcast(rabbitmq),
		PenaltyExport: NewPenaltyExporter(),
		FileStorage:  GetOrCreateS3FileStorage(),
	}
}
