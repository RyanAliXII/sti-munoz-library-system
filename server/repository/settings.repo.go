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

func(repo * SettingsRepository) Get()model.SettingsValue{

	settings := model.Settings{}
	query := `SELECT value from system.settings limit 1`;
	getErr := repo.db.Get(&settings, query)
	if getErr != nil {
		logger.Error(getErr.Error(), slimlog.Function("SettingsRepository.Get"), slimlog.Error("getErr"))
	}

	return settings.Value
}
func(repo * SettingsRepository)UpdateSettings(settings model.SettingsValue)error{
	jsonBytes, err := settings.ToBytes()
	if err != nil {
		return err
	}
	_, err = repo.db.Exec("UPDATE system.settings set value = $1",  jsonBytes)
	return err 
}
func NewSettingsRepository ()  SettingsRepositoryInterface{

	return &SettingsRepository{
		db:      postgresdb.GetOrCreateInstance(),
		
	}
}

type SettingsRepositoryInterface interface {
	Get() model.SettingsValue
	UpdateSettings(settings model.SettingsValue)error
}
