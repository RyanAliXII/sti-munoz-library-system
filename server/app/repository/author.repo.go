package repository

import (
	"slim-app/server/app/model"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

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
	logger.Info("Author deleted", zap.Int("authorId", id), zap.Int64("affectedRows", affected), zap.String("function", "AuthorRepository.Delete"))
	return deleteErr
}

func (repo *AuthorRepository) Update(id int, author model.Author) error {

	updateStmt, prepareErr := repo.db.Preparex("Update book.authors SET given_name = $1, middle_name = $2, surname = $3 where id = $4")
	if prepareErr != nil {
		logger.Error(prepareErr.Error(), zap.Int("authorId", id), zap.String("function", "AuthorRepository.Update"))
		return prepareErr
	}
	updateResult, updateErr := updateStmt.Exec(author.GivenName, author.MiddleName, author.Surname, id)
	if updateErr != nil {
		logger.Error(updateErr.Error(), zap.Int("authorId", id), zap.String("function", "AuthorRepository.Update"))
		return updateErr
	}
	affected, getAffectedErr := updateResult.RowsAffected()
	if getAffectedErr != nil {
		logger.Warn(getAffectedErr.Error(), zap.Int("authordId", id), zap.String("function", "AuthorRepository.Update"))
	}
	logger.Info("Author updated", zap.Int("authorId", id), zap.Int64("affectedRows", affected), zap.String("function", "AuthorRepository.Update"))
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
