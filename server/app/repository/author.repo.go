package repository

import (
	"slim-app/server/app/model"
	"slim-app/server/app/pkg/slimlog"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type AuthorRepository struct {
	db *sqlx.DB
}

func (repo *AuthorRepository) New(author model.Author) error {
	_, insertErr := repo.db.NamedExec("INSERT INTO catalog.author(given_name, middle_name, surname)VALUES(:given_name, :middle_name, :surname )", author)
	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function(NEW_AUTHOR))
	}
	return insertErr
}
func (repo *AuthorRepository) Get() []model.Author {

	var authors []model.Author = make([]model.Author, 0)
	selectErr := repo.db.Select(&authors, "SELECT * FROM catalog.author where deleted_at IS NULL")
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function(GET_AUTHORS))
	}
	return authors
}
func (repo *AuthorRepository) Delete(id int) error {
	deleteStmt, prepareErr := repo.db.Preparex("UPDATE catalog.author SET deleted_at = now() where id=$1")
	if prepareErr != nil {
		logger.Error(prepareErr.Error(), zap.Int("authorId", id), slimlog.Function(DELETE_AUTHOR))
		return prepareErr
	}
	deleteResult, deleteErr := deleteStmt.Exec(id)
	affected, getAffectedErr := deleteResult.RowsAffected()
	if getAffectedErr != nil || affected > SINGLE_RESULT {
		logger.Warn(getAffectedErr.Error(), zap.Int("authorId", id), slimlog.Function(DELETE_AUTHOR))
	}
	logger.Info("Author deleted", zap.Int("authorId", id), slimlog.AffectedRows(affected), slimlog.Function(DELETE_AUTHOR))
	return deleteErr
}

func (repo *AuthorRepository) Update(id int, author model.Author) error {

	updateStmt, prepareErr := repo.db.Preparex("Update catalog.author SET given_name = $1, middle_name = $2, surname = $3 where id = $4")
	if prepareErr != nil {
		logger.Error(prepareErr.Error(), zap.Int("authorId", id), slimlog.Function(UPDATE_AUTHOR))
		return prepareErr
	}
	updateResult, updateErr := updateStmt.Exec(author.GivenName, author.MiddleName, author.Surname, id)
	if updateErr != nil {
		logger.Error(updateErr.Error(), zap.Int("authorId", id), slimlog.Function(UPDATE_AUTHOR))
		return updateErr
	}
	affected, getAffectedErr := updateResult.RowsAffected()
	if getAffectedErr != nil || affected > SINGLE_RESULT {
		logger.Warn(getAffectedErr.Error(), zap.Int("authordId", id), slimlog.Function(UPDATE_AUTHOR))
	}
	logger.Info("Author updated", zap.Int("authorId", id), slimlog.AffectedRows(affected), slimlog.Function(UPDATE_AUTHOR))
	return updateErr
}
func NewAuthorRepository(db *sqlx.DB) AuthorRepositoryInterface {
	return &AuthorRepository{
		db: db,
	}
}

type AuthorRepositoryInterface interface {
	New(model.Author) error
	Get() []model.Author
	Delete(id int) error
	Update(id int, author model.Author) error
}
