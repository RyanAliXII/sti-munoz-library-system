package repository

import (
	"slim-app/server/app/model"
	"slim-app/server/app/pkg/slimlog"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type SOFRepository struct {
	db *sqlx.DB
}

func (repo *SOFRepository) Get() []model.SOF {
	var sources []model.SOF = make([]model.SOF, 0)
	selectErr := repo.db.Select(&sources, "SELECT id, name from catalog.source_of_fund where deleted_at is null")
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function(GET_SOURCES))
	}
	return sources
}
func (repo *SOFRepository) New(source model.SOF) error {
	_, insertErr := repo.db.NamedExec("INSERT INTO catalog.source_of_fund(name)VALUES(:name)", source)
	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function(NEW_SOURCE))
	}
	return insertErr
}
func (repo *SOFRepository) Delete(id int) error {
	deleteStmt, prepareErr := repo.db.Preparex("UPDATE catalog.source_of_fund SET deleted_at = now() where id=$1")
	if prepareErr != nil {
		logger.Error(prepareErr.Error(), zap.Int("sourceId", id), slimlog.Function(DELETE_SOURCE))
		return prepareErr
	}
	deleteResult, deleteErr := deleteStmt.Exec(id)
	affected, getAffectedErr := deleteResult.RowsAffected()
	if getAffectedErr != nil || affected > SINGLE_RESULT {
		logger.Warn(getAffectedErr.Error(), zap.Int("sourceId", id), slimlog.Function(DELETE_SOURCE))
	}
	logger.Info("Source deleted.", zap.Int("sourceId", id), slimlog.AffectedRows(affected), slimlog.Function(DELETE_SOURCE))
	return deleteErr
}
func (repo *SOFRepository) Update(id int, source model.SOF) error {
	updateStmt, prepareErr := repo.db.Preparex("UPDATE catalog.source_of_fund SET name = $1 where id=$2")
	if prepareErr != nil {
		logger.Error(prepareErr.Error(), zap.Int("sourceId", id), slimlog.Function(UPDATE_SOURCE))
		return prepareErr
	}
	updateResult, updateErr := updateStmt.Exec(source.Name, id)
	affected, getAffectedErr := updateResult.RowsAffected()
	if getAffectedErr != nil || affected > SINGLE_RESULT {
		logger.Warn(getAffectedErr.Error(), zap.Int("sourceId", id), slimlog.Function(UPDATE_SOURCE))
	}
	logger.Info("Source updated", zap.Int("sourceId", id), slimlog.AffectedRows(affected), slimlog.Function(UPDATE_SOURCE))
	return updateErr
}
func NewSOFRepository(db *sqlx.DB) SOFInterface {
	return &SOFRepository{
		db: db,
	}
}

type SOFInterface interface {
	Get() []model.SOF
	New(source model.SOF) error
	Delete(id int) error
	Update(id int, source model.SOF) error
}
