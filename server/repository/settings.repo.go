package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)


type SettingsRepository struct {
	db *sqlx.DB
}

func(repo * SettingsRepository) Get()model.Settings{

	settings := model.Settings{}
	query := `SELECT value from system.settings limit 1`;
	getErr := repo.db.Get(&settings, query)
	if getErr != nil {
		logger.Error(getErr.Error(), slimlog.Function("SettingsRepository.Get"), slimlog.Error("getErr"))
	}

	return settings
}
func NewSettingsRepository ()  SettingsRepositoryInterface{

	return &SettingsRepository{
		db:      postgresdb.GetOrCreateInstance(),
	}
}

type SettingsRepositoryInterface interface {
	Get()model.Settings

}
