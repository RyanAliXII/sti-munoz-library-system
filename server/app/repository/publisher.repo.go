package repository

import (
	"slim-app/server/app/model"
	"slim-app/server/app/pkg/slimlog"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type PublisherRepository struct {
	db *sqlx.DB
}

func (repo *PublisherRepository) Get() []model.Publisher {
	var publishers []model.Publisher = make([]model.Publisher, 0)
	selectErr := repo.db.Select(&publishers, "SELECT id, name from book.publishers where deleted_at is null")
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function(GET_PUBLISHERS))
	}
	return publishers
}
func (repo *PublisherRepository) New(publisher model.Publisher) error {
	_, insertErr := repo.db.NamedExec("INSERT INTO book.publishers(name)VALUES(:name)", publisher)
	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function(NEW_PUBLISHER))
	}
	return insertErr
}
func (repo *PublisherRepository) Delete(id int) error {
	deleteStmt, prepareErr := repo.db.Preparex("UPDATE book.publishers SET deleted_at = now() where id=$1")
	if prepareErr != nil {
		logger.Error(prepareErr.Error(), zap.Int("publisherId", id), slimlog.Function(DELETE_PUBLISHER))
		return prepareErr
	}
	deleteResult, deleteErr := deleteStmt.Exec(id)
	affected, getAffectedErr := deleteResult.RowsAffected()
	if getAffectedErr != nil || affected > SINGLE_RESULT {
		logger.Warn(getAffectedErr.Error(), zap.Int("publisherId", id), slimlog.Function(DELETE_PUBLISHER))
	}
	logger.Info("Publisher Deleted", zap.Int("publisherId", id), slimlog.AffectedRows(affected), slimlog.Function(DELETE_PUBLISHER))
	return deleteErr
}
func (repo *PublisherRepository) Update(id int, publisher model.Publisher) error {
	updateStmt, prepareErr := repo.db.Preparex("Update book.publishers SET name=$1 where id=$2")
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
	if getAffectedErr != nil || affected > SINGLE_RESULT {
		logger.Warn(getAffectedErr.Error(), zap.Int("publisherId", id), slimlog.Function(UPDATE_PUBLISHER))
	}
	logger.Info("Publisher Updated", zap.Int("publisherId", id), slimlog.AffectedRows(affected), slimlog.Function(UPDATE_PUBLISHER))
	return updateErr
}
func NewPublisherRepository(db *sqlx.DB) PublisherRepositoryInterface {
	return &PublisherRepository{
		db: db,
	}
}

type PublisherRepositoryInterface interface {
	Get() []model.Publisher
	New(publisher model.Publisher) error
	Delete(id int) error
	Update(id int, publisher model.Publisher) error
}