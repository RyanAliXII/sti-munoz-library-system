package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

const (
	GET_PUBLISHERS   = "Publisher.Get"
	NEW_PUBLISHER    = "Publisher.New"
	DELETE_PUBLISHER = "Publisher.Delete"
	UPDATE_PUBLISHER = "Publisher.Update"
)

type Publisher struct {
	db *sqlx.DB
}

func (repo *Publisher) Get(filter * filter.Filter) []model.Publisher {
	var publishers []model.Publisher = make([]model.Publisher, 0)
	selectErr := repo.db.Select(&publishers, "SELECT id, name from catalog.publisher where deleted_at is null ORDER BY created_at DESC LIMIT $1 OFFSET $2", filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function(GET_PUBLISHERS))
	}
	return publishers
}

func (repo *Publisher) Search(filter * filter.Filter) []model.Publisher {
	var publishers []model.Publisher = make([]model.Publisher, 0)
	selectErr := repo.db.Select(&publishers, "SELECT id, name from catalog.publisher where deleted_at is null and name ILIKE '%' || $1 || '%'  ORDER BY created_at DESC LIMIT $2 OFFSET $3", filter.Keyword, filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function(GET_PUBLISHERS))
	}
	return publishers
}
func (repo *Publisher) New(publisher model.Publisher) (model.Publisher, error) {
	newPublisher := model.Publisher{}
 	insertErr := repo.db.Get(&newPublisher,"INSERT INTO catalog.publisher(name)VALUES($1) RETURNING id, name", publisher.Name)
	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function(NEW_PUBLISHER), slimlog.Error("insertErr"))
		return newPublisher, insertErr
	}
	return newPublisher, insertErr
}
func (repo *Publisher) Delete(id string) error {
	deleteStmt, prepareErr := repo.db.Preparex("UPDATE catalog.publisher SET deleted_at = now() where id=$1")
	if prepareErr != nil {
		logger.Error(prepareErr.Error(), zap.String("publisherId", id), slimlog.Function(DELETE_PUBLISHER))
		return prepareErr
	}
	deleteResult, deleteErr := deleteStmt.Exec(id)
	affected, getAffectedErr := deleteResult.RowsAffected()
	const SINGLE_RESULT = 1
	if getAffectedErr != nil || affected > SINGLE_RESULT {
		logger.Warn(getAffectedErr.Error(), zap.String("publisherId", id), slimlog.Function(DELETE_PUBLISHER))
	}
	logger.Info("model.Publisher Deleted", zap.String("publisherId", id), slimlog.AffectedRows(affected), slimlog.Function(DELETE_PUBLISHER))
	return deleteErr
}
func (repo *Publisher) Update(id string, publisher model.Publisher) error {
	updateStmt, prepareErr := repo.db.Preparex("Update catalog.publisher SET name=$1 where id=$2")
	if prepareErr != nil {
		logger.Error(prepareErr.Error(), zap.String("publisherId", id), slimlog.Function(UPDATE_PUBLISHER))
		return prepareErr
	}
	updateResult, updateErr := updateStmt.Exec(publisher.Name, id)
	if updateErr != nil {
		logger.Error(updateErr.Error(), zap.String("publisherId", id), slimlog.Function(UPDATE_PUBLISHER))
		return updateErr
	}
	affected, getAffectedErr := updateResult.RowsAffected()
	const SINGLE_RESULT = 1
	if getAffectedErr != nil || affected > SINGLE_RESULT {
		logger.Warn(getAffectedErr.Error(), zap.String("publisherId", id), slimlog.Function(UPDATE_PUBLISHER))
	}
	logger.Info("model.Publisher Updated", zap.String("publisherId", id), slimlog.AffectedRows(affected), slimlog.Function(UPDATE_PUBLISHER))
	return updateErr
}
func NewPublisherRepository(db * sqlx.DB) PublisherRepository {
	return &Publisher{
		db: db,
	}
}

type PublisherRepository interface {
	Get(*filter.Filter) []model.Publisher
	New(publisher model.Publisher) (model.Publisher, error)
	Delete(id string) error
	Update(id string, publisher model.Publisher) error
	Search(filter * filter.Filter) []model.Publisher 
}
