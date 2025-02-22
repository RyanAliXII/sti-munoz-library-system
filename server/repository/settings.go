package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)


type Settings struct {
	db *sqlx.DB
}
func(repo * Settings) Get()model.SettingsValue{

	settings := model.Settings{}
	query := `SELECT value from system.settings limit 1`;
	getErr := repo.db.Get(&settings, query)
	if getErr != nil {
		logger.Error(getErr.Error(), applog.Function("Settings.Get"), applog.Error("getErr"))
	}
	return settings.Value
}
func(repo * Settings)UpdateSettings(settings model.SettingsValue)error{
	jsonBytes, err := settings.ToBytes()
	if err != nil {
		return err
	}
	_, err = repo.db.Exec("UPDATE system.settings set value = $1",  jsonBytes)
	return err 
}
func NewSettingsRepository(db * sqlx.DB)SettingsRepository{
	return &Settings{
		db:db,
	}
}

type SettingsRepository interface {
	Get() model.SettingsValue
	UpdateSettings(settings model.SettingsValue)error
}
