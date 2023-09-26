package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"

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

func (repo *AuthorRepository) New(author model.Author) (model.Author, error) {	
	 newAuthor := model.Author{}
	 insertErr := repo.db.Get(&newAuthor, "INSERT INTO catalog.author(name)VALUES($1) RETURNING id, name",author.Name)
	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function(NEW_AUTHOR))
	}
	return newAuthor, insertErr
}
func (repo *AuthorRepository) Get(filter * filter.Filter) ([]model.Author) {
	authors := make([]model.Author, 0)
	if filter.Page <= 0 {
		filter.Page = 1
	}
	selectErr := repo.db.Select(&authors, "SELECT id, name FROM catalog.author where deleted_at IS NULL ORDER BY created_at DESC LIMIT  $1 OFFSET $2", filter.Limit, filter.Offset)
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
	SELECT author.id,author.name
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

	updateStmt, prepareErr := repo.db.Preparex("Update catalog.author SET name = $1 where id = $2")
	if prepareErr != nil {
		logger.Error(prepareErr.Error(), zap.Int("authorId", id), slimlog.Function(UPDATE_AUTHOR), slimlog.Error("prepareErr"))
		return prepareErr
	}
	updateResult, updateErr := updateStmt.Exec(author.Name, id)
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


func NewAuthorRepository() AuthorRepositoryInterface {
	db := postgresdb.GetOrCreateInstance()
	return &AuthorRepository{
		db: db,
	}
}

type AuthorRepositoryInterface interface {
	New(model.Author) (model.Author, error)
	Get(*filter.Filter ) []model.Author
	GetAuthoredBook(string) []model.Author
	Delete(id int) error
	Update(id int, author model.Author) error
}
