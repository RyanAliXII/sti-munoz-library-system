package repository

import (
	"slim-app/server/app/pkg/postgresdb"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/model"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type AuthorRepository struct {
	db *sqlx.DB
}

const (
	NEW_AUTHOR    = "AuthorRepository.New"
	GET_AUTHORS   = "AuthorRepository.Get"
	DELETE_AUTHOR = "AuthorRepository.Delete"
	UPDATE_AUTHOR = "AuthorRepository.Update"
	NEW_ORG       = "AuthoRepository.NewOrganization"
	GET_ORGS      = "AuthorRepository.GetOrganizations"
	DELETE_ORG    = "AuthorRepository.DeleteOrganization"
	UPDATE_ORG    = "AuthorRepository.UpdateOrganization"
)

func (repo *AuthorRepository) New(author model.Author) error {

	_, insertErr := repo.db.NamedExec("INSERT INTO catalog.author(given_name, middle_name, surname)VALUES(:given_name, :middle_name, :surname )", author)
	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function(NEW_AUTHOR))
	}
	return insertErr
}
func (repo *AuthorRepository) Get() []model.Author {

	var authors []model.Author = make([]model.Author, 0)
	selectErr := repo.db.Select(&authors, "SELECT id,given_name, middle_name, surname FROM catalog.author where deleted_at IS NULL ORDER BY created_at DESC")
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function(GET_AUTHORS), slimlog.Error("selectErr"))
	}
	return authors
}
func (repo *AuthorRepository) Delete(id int) error {
	deleteStmt, prepareErr := repo.db.Preparex("UPDATE catalog.author SET deleted_at = now() where id=$1")
	if prepareErr != nil {
		logger.Error(prepareErr.Error(), zap.Int("authorId", id), slimlog.Function(DELETE_AUTHOR), slimlog.Error("prepareErr"))
		return prepareErr
	}
	deleteResult, deleteErr := deleteStmt.Exec(id)
	affected, getAffectedErr := deleteResult.RowsAffected()
	const SINGLE_RESULT = 1
	if getAffectedErr != nil || affected > SINGLE_RESULT {
		logger.Warn(getAffectedErr.Error(), zap.Int("authorId", id), slimlog.Function(DELETE_AUTHOR))
	}
	logger.Info("model.Author deleted", zap.Int("authorId", id), slimlog.AffectedRows(affected), slimlog.Function(DELETE_AUTHOR))
	return deleteErr
}
func (repo *AuthorRepository) GetAuthoredBook(bookId string) []model.Author {
	var authors []model.Author = make([]model.Author, 0)
	query := `
	SELECT author.id,  author.given_name, author.middle_name, author.surname
	FROM catalog.book_author
	INNER JOIN catalog.author on book_author.author_id = catalog.author.id
	INNER JOIN catalog.book on book_author.book_id = book.id
	WHERE book.id = $1
	`
	selectErr := repo.db.Select(&authors, query, bookId)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("AuthorRepository.GetBookById"), slimlog.Error("selectErr"))
	}
	return authors
}
func (repo *AuthorRepository) Update(id int, author model.Author) error {

	updateStmt, prepareErr := repo.db.Preparex("Update catalog.author SET given_name = $1, middle_name = $2, surname = $3 where id = $4")
	if prepareErr != nil {
		logger.Error(prepareErr.Error(), zap.Int("authorId", id), slimlog.Function(UPDATE_AUTHOR), slimlog.Error("prepareErr"))
		return prepareErr
	}
	updateResult, updateErr := updateStmt.Exec(author.GivenName, author.MiddleName, author.Surname, id)
	if updateErr != nil {
		logger.Error(updateErr.Error(), zap.Int("authorId", id), slimlog.Function(UPDATE_AUTHOR), slimlog.Error("updateErr"))
		return updateErr
	}
	affected, getAffectedErr := updateResult.RowsAffected()
	const SINGLE_RESULT = 1
	if getAffectedErr != nil || affected > SINGLE_RESULT {
		logger.Warn(getAffectedErr.Error(), zap.Int("authordId", id), slimlog.Function(UPDATE_AUTHOR))
	}
	logger.Info("model.Author updated", zap.Int("authorId", id), slimlog.AffectedRows(affected), slimlog.Function(UPDATE_AUTHOR))
	return updateErr
}

func (repo *AuthorRepository) NewOrganization(org model.Organization) error {

	_, insertErr := repo.db.NamedExec("INSERT INTO catalog.organization(name)VALUES(:name )", org)
	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function(NEW_ORG), slimlog.Error("insertErr"))
	}
	return insertErr
}
func (repo *AuthorRepository) GetOrganization() []model.Organization {
	orgs := make([]model.Organization, 0)
	selectErr := repo.db.Select(&orgs, "Select id,name from catalog.organization where deleted_at is null")
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function(GET_ORGS), slimlog.Error("selectErr"))
	}
	return orgs
}
func (repo *AuthorRepository) DeleteOrganization(id int) error {
	_, deleteErr := repo.db.Exec("UPDATE catalog.organization SET deleted_at  = NOW() Where id = $1", id)
	if deleteErr != nil {
		logger.Error(deleteErr.Error(), slimlog.Function(DELETE_ORG), slimlog.Error("deleteErr"))
	}
	return deleteErr
}
func (repo *AuthorRepository) UpdateOrganization(org model.Organization) error {
	_, updateErr := repo.db.Exec("UPDATE catalog.organization SET name = $1 Where id = $2", org.Name, org.Id)
	if updateErr != nil {
		logger.Error(updateErr.Error(), slimlog.Function(UPDATE_ORG), slimlog.Error("updateErr"))
	}
	return updateErr
}
func NewAuthorRepository() AuthorRepositoryInterface {
	db := postgresdb.GetOrCreateInstance()
	return &AuthorRepository{
		db: db,
	}
}

type AuthorRepositoryInterface interface {
	New(model.Author) error
	Get() []model.Author
	GetAuthoredBook(string) []model.Author
	Delete(id int) error
	Update(id int, author model.Author) error
	NewOrganization(org model.Organization) error
	GetOrganization() []model.Organization
	DeleteOrganization(id int) error
	UpdateOrganization(org model.Organization) error
}
