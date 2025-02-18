package services

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/configmanager"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/filestorage"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/permissionstore"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/rabbitmq"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/RyanAliXII/sti-munoz-library-system/server/validator"
	"github.com/jmoiron/sqlx"
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
	PermissionValidator middlewares.PermissionValidator
	Validator validator.Validator
	PermissionStore permissionstore.PermissionStore
}
type ServicesDependency struct {
	Db * sqlx.DB
	RabbitMQ * rabbitmq.RabbitMQ
	FileStorage  filestorage.FileStorage
	ConfigManager * configmanager.Config
	PermissionStore permissionstore.PermissionStore
}
func BuildServices (deps * ServicesDependency) Services {

	return Services{
		Notification: NewNotificationService(deps.RabbitMQ),
		Repos: repository.New(deps.Db, deps.FileStorage),
		ClientLogExport: NewClienLogExporter(),
		BorrowedBookExport: NewBorrowedBookExporter(),
		Logger: slimlog.GetInstance(),
		Broadcaster: NewRabbitMQBroadcast(deps.RabbitMQ),
		PenaltyExport: NewPenaltyExporter(),
		FileStorage:  GetOrCreateS3FileStorage(),
		BookCoverService: NewBookCoverService(s3FileStorage),
		PermissionValidator: middlewares.NewPermissionValidator(deps.PermissionStore),
		Validator: validator.NewValidator(deps.Db),
		PermissionStore: deps.PermissionStore,
	}
}
