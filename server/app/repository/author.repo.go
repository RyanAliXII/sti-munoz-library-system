package repository

import (
	"fmt"
	"slim-app/server/app/http/definitions"

	"github.com/jmoiron/sqlx"
)

type AuthorRepository struct {
	db *sqlx.DB
}

func (repo *AuthorRepository) New(author definitions.AuthorModel) error {
	_, insertErr := repo.db.NamedExec("INSERT INTO book.authors(given_name, middle_name, surname)VALUES(:given_name, :middle_name, :surname )", author)
	return insertErr
}
func (repo *AuthorRepository) Get() []definitions.AuthorModel {
	var authors []definitions.AuthorModel = make([]definitions.AuthorModel, 0)
	selectErr := repo.db.Select(&authors, "SELECT * FROM book.authors")
	if selectErr != nil {
		fmt.Println(selectErr.Error())
	}
	return authors
}

func NewAuthorRepository(db *sqlx.DB) *AuthorRepository {
	return &AuthorRepository{
		db: db,
	}
}

type AuthorRepositoryInterface interface {
	New(author definitions.AuthorModel) error
	Get() []definitions.AuthorModel
}
