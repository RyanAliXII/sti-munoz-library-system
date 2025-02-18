package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

const (
	GET_SOURCES   = "FundSourceRepository.Get"
	NEW_SOURCE    = "FundSourceRepository.New"
	DELETE_SOURCE = "FundSourceRepository.Delete"
	UPDATE_SOURCE = "FundSourceRepository.Update"
)

type FundSourceRepository struct {
	db *sqlx.DB
}

func (repo *FundSourceRepository) Get() []model.FundSource {
	var sources []model.FundSource = make([]model.FundSource, 0)
	selectErr := repo.db.Select(&sources, "SELECT id, name from catalog.source_of_fund where deleted_at is null")
	if selectErr != nil {
		logger.Error(selectErr.Error(), applog.Function(GET_SOURCES), applog.Error("selectErr"))
	}
	return sources
}
func (repo *FundSourceRepository) New(source model.FundSource) error {
	_, insertErr := repo.db.NamedExec("INSERT INTO catalog.source_of_fund(name)VALUES(:name)", source)
	if insertErr != nil {
		logger.Error(insertErr.Error(), applog.Function(NEW_SOURCE), applog.Error("insertErr"))
	}
	return insertErr
}
func (repo *FundSourceRepository) Delete(id int) error {
	deleteStmt, prepareErr := repo.db.Preparex("UPDATE catalog.source_of_fund SET deleted_at = now() where id=$1")
	if prepareErr != nil {
		logger.Error(prepareErr.Error(), zap.Int("sourceId", id), applog.Function(DELETE_SOURCE), applog.Error("prepareErr"))
		return prepareErr
	}
	deleteResult, deleteErr := deleteStmt.Exec(id)
	affected, getAffectedErr := deleteResult.RowsAffected()
	const SINGLE_RESULT = 1
	if getAffectedErr != nil || affected > SINGLE_RESULT {
		logger.Warn(getAffectedErr.Error(), zap.Int("sourceId", id), applog.Function(DELETE_SOURCE))
	}
	logger.Info("Source deleted.", zap.Int("sourceId", id), applog.AffectedRows(affected), applog.Function(DELETE_SOURCE))
	return deleteErr
}
func (repo *FundSourceRepository) Update(id int, source model.FundSource) error {
	updateStmt, prepareErr := repo.db.Preparex("UPDATE catalog.source_of_fund SET name = $1 where id=$2")
	if prepareErr != nil {
		logger.Error(prepareErr.Error(), zap.Int("sourceId", id), applog.Function(UPDATE_SOURCE), applog.Error("prepareErr"))
		return prepareErr
	}
	updateResult, updateErr := updateStmt.Exec(source.Name, id)
	affected, getAffectedErr := updateResult.RowsAffected()
	const SINGLE_RESULT = 1
	if getAffectedErr != nil || affected > SINGLE_RESULT {
		logger.Warn(getAffectedErr.Error(), zap.Int("sourceId", id), applog.Function(UPDATE_SOURCE))
	}
	logger.Info("Source updated", zap.Int("sourceId", id), applog.AffectedRows(affected), applog.Function(UPDATE_SOURCE))
	return updateErr
}
func NewFundSourceRepository(db *sqlx.DB) FundSourceRepositoryInterface {
	return &FundSourceRepository{
		db: db,
	}
}

type FundSourceRepositoryInterface interface {
	Get() []model.FundSource
	New(source model.FundSource) error
	Delete(id int) error
	Update(id int, source model.FundSource) error
}
