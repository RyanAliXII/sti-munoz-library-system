package repository

import (
	"slim-app/server/app/pkg/postgresdb"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/model"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

const (
	GET_PUBLISHERS   = "PublisherRepository.Get"
	NEW_PUBLISHER    = "PublisherRepository.New"
	DELETE_PUBLISHER = "PublisherRepository.Delete"
	UPDATE_PUBLISHER = "PublisherRepository.Update"
)

type PublisherRepository struct {
	db *sqlx.DB
}

func (repo *PublisherRepository) Get() []model.Publisher {
	var publishers []model.Publisher = make([]model.Publisher, 0)
	selectErr := repo.db.Select(&publishers, "SELECT id, name from catalog.publisher where deleted_at is null")
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function(GET_PUBLISHERS))
	}
	return publishers
}
func (repo *PublisherRepository) New(publisher model.Publisher) error {
	_, insertErr := repo.db.NamedExec("INSERT INTO catalog.publisher(name)VALUES(:name)", publisher)
	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function(NEW_PUBLISHER))
	}
	return insertErr
}
func (repo *PublisherRepository) Delete(id int) error {
	deleteStmt, prepareErr := repo.db.Preparex("UPDATE catalog.publisher SET deleted_at = now() where id=$1")
	if prepareErr != nil {
		logger.Error(prepareErr.Error(), zap.Int("publisherId", id), slimlog.Function(DELETE_PUBLISHER))
		return prepareErr
	}
	deleteResult, deleteErr := deleteStmt.Exec(id)
	affected, getAffectedErr := deleteResult.RowsAffected()
	const SINGLE_RESULT = 1
	if getAffectedErr != nil || affected > SINGLE_RESULT {
		logger.Warn(getAffectedErr.Error(), zap.Int("publisherId", id), slimlog.Function(DELETE_PUBLISHER))
	}
	logger.Info("model.Publisher Deleted", zap.Int("publisherId", id), slimlog.AffectedRows(affected), slimlog.Function(DELETE_PUBLISHER))
	return deleteErr
}
func (repo *PublisherRepository) Update(id int, publisher model.Publisher) error {
	updateStmt, prepareErr := repo.db.Preparex("Update catalog.publisher SET name=$1 where id=$2")
	if prepareErr != nil {
		logger.Error(prepareErr.Error(), zap.Int("publisherId", id), slimlog.Function(UPDATE_PUBLISHER))
		return prepareErr
	}
	updateResult, updateErr := updateStmt.Exec(publisher.Name, id)
	if updateErr != nil {
		logger.Error(updateErr.Error(), zap.Int("publisherId", id), slimlog.Function(UPDATE_PUBLISHER))
		return updateErr
	}
	affected, getAffectedErr := updateResult.RowsAffected()
	const SINGLE_RESULT = 1
	if getAffectedErr != nil || affected > SINGLE_RESULT {
		logger.Warn(getAffectedErr.Error(), zap.Int("publisherId", id), slimlog.Function(UPDATE_PUBLISHER))
	}
	logger.Info("model.Publisher Updated", zap.Int("publisherId", id), slimlog.AffectedRows(affected), slimlog.Function(UPDATE_PUBLISHER))
	return updateErr
}
func NewPublisherRepository() PublisherRepositoryInterface {
	return &PublisherRepository{
		db: postgresdb.GetOrCreateInstance(),
	}
}

type PublisherRepositoryInterface interface {
	Get() []model.Publisher
	New(publisher model.Publisher) error
	Delete(id int) error
	Update(id int, publisher model.Publisher) error
}
