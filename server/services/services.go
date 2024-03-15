package services

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/minioclient"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
)

type Services struct {
	Notification  NotificationService;
	Repos * repository.Repositories
	ClientLogExport ClientLogExporter
}
func BuildServices () Services {
	minioclient := minioclient.GetorCreateInstance()
	db := postgresdb.GetOrCreateInstance()
	return Services{
		Notification: NewNotificationService(),
		Repos: repository.New(db, minioclient),
		ClientLogExport: NewClienLogExporter(),
	}
}
