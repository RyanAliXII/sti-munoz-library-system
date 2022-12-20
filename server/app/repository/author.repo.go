package repository

import (
	"slim-app/server/app/model"
	"slim-app/server/app/pkg/slimlog"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

var logger = slimlog.GetInstance()

type AuthorRepository struct {
	db *sqlx.DB
}

func (repo *AuthorRepository) New(author model.Author) error {
	_, insertErr := repo.db.NamedExec("INSERT INTO book.authors(given_name, middle_name, surname)VALUES(:given_name, :middle_name, :surname )", author)
	if insertErr != nil {
		logger.Error(insertErr.Error())
	}
	return insertErr
}
func (repo *AuthorRepository) Get() []model.Author {

	var authors []model.Author = make([]model.Author, 0)
	selectErr := repo.db.Select(&authors, "SELECT * FROM book.authors where deleted_at IS NULL")
	if selectErr != nil {
		logger.Error(selectErr.Error(), zap.String("location", "AuthorRepository.Get"))
	}
	return authors
}
func (repo *AuthorRepository) Delete(id int) error {
	deleteStmt, prepareErr := repo.db.Preparex("UPDATE book.authors SET deleted_at = now() where id=$1")
	if prepareErr != nil {
		logger.Error(prepareErr.Error(), zap.Int("id", id), zap.String("function", "AuthorRepository.Delete"))
		return prepareErr
	}
	deleteResult, deleteErr := deleteStmt.Exec(id)
	affected, getAffectedErr := deleteResult.RowsAffected()
	if getAffectedErr != nil {
		logger.Warn(getAffectedErr.Error(), zap.Int("id", id), zap.String("function", "AuthorRepository.Delete"))
	}
	logger.Info("Author deleted", zap.Int("id", id), zap.Int64("affected", affected), zap.String("function", "AuthorRepository.Delete"))
	return deleteErr
}
func NewAuthorRepository(db *sqlx.DB) *AuthorRepository {
	return &AuthorRepository{
		db: db,
	}
}

type AuthorRepositoryInterface interface {
	New(model.Author) error
	Get() []model.Author
	Delete(id int) error
}
