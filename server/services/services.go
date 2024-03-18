package services

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/minioclient"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
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
}
func BuildServices () Services {
	minioclient := minioclient.GetorCreateInstance()
	db := postgresdb.GetOrCreateInstance()
	return Services{
		Notification: NewNotificationService(),
		Repos: repository.New(db, minioclient),
		ClientLogExport: NewClienLogExporter(),
		BorrowedBookExport: NewBorrowedBookExporter(),
		Logger: slimlog.GetInstance(),
	}
}
