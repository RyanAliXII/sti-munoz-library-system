package services

import (
	"github.com/MicahParks/keyfunc"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/configmanager"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/filestorage"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/permissionstore"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/rabbitmq"
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
	TokenValidator middlewares.TokenValidator
	Validator validator.Validator
	PermissionStore permissionstore.PermissionStore
	Jwks *keyfunc.JWKS
	Config * configmanager.Config
}
type ServicesDependency struct {
	Db * sqlx.DB
	RabbitMQ * rabbitmq.RabbitMQ
	FileStorage  filestorage.FileStorage
	Config * configmanager.Config
	PermissionStore permissionstore.PermissionStore
	Logger * zap.Logger
	Jwks *keyfunc.JWKS
}
func BuildServices (deps * ServicesDependency) Services {
	return Services{
		Notification: NewNotificationService(deps.RabbitMQ, deps.Logger),
		Repos: repository.New(deps.Db, deps.FileStorage),
		ClientLogExport: NewClienLogExporter(),
		BorrowedBookExport: NewBorrowedBookExporter(),
		Logger: deps.Logger,
		Broadcaster: NewRabbitMQBroadcast(deps.RabbitMQ),
		PenaltyExport: NewPenaltyExporter(),
		FileStorage:  deps.FileStorage,
		BookCoverService: NewBookCoverService(deps.FileStorage, deps.Config),
		PermissionValidator: middlewares.NewPermissionValidator(deps.PermissionStore, deps.Config),
		TokenValidator: middlewares.NewTokenValidator(deps.Db, deps.Logger, deps.Jwks, deps.Config),
		Validator: validator.NewValidator(deps.Db),
		PermissionStore: deps.PermissionStore,
		Jwks: deps.Jwks,
		Config: deps.Config,
	}
}
