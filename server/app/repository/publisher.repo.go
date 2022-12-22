package repository

import (
	"slim-app/server/app/model"

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
		logger.Error(selectErr.Error())
	}
	return publishers
}
func (repo *PublisherRepository) New(publisher model.Publisher) error {
	_, insertErr := repo.db.NamedExec("INSERT INTO book.publishers(name)VALUES(:name)", publisher)
	if insertErr != nil {
		logger.Error(insertErr.Error())
	}
	return insertErr
}
func (repo *PublisherRepository) Delete(id int) error {
	deleteStmt, prepareErr := repo.db.Preparex("UPDATE book.publishers SET deleted_at = now() where id=$1")
	if prepareErr != nil {
		logger.Error(prepareErr.Error(), zap.Int("publisherId", id), zap.String("function", "PublisherRepository.Delete"))
		return prepareErr
	}
	deleteResult, deleteErr := deleteStmt.Exec(id)
	affected, getAffectedErr := deleteResult.RowsAffected()
	if getAffectedErr != nil {
		logger.Warn(getAffectedErr.Error(), zap.Int("publisherId", id), zap.String("function", "PublisherRepository.Delete"))
	}
	logger.Info("Publisher Deleted", zap.Int("publisherId", id), zap.Int64("affectedRows", affected), zap.String("function", "PublisherRepository.Delete"))
	return deleteErr
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
}
