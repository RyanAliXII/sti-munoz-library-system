package repository

import (
	"fmt"
	"slim-app/server/app/model"
	cutters "slim-app/server/app/pkg/cutters"
	"slim-app/server/app/pkg/slimlog"

	"github.com/jmoiron/sqlx"
)

var RepoName string = "AuthorNumberRepository"

type AuthorNumberRepository struct {
	cutters *cutters.Cutters
	db      *sqlx.DB
}

func (repo *AuthorNumberRepository) Get(filter Filter) []model.AuthorNumber {
	var table []model.AuthorNumber = make([]model.AuthorNumber, 0)
	fmt.Println(filter)
	selectErr := repo.db.Select(&table, "SELECT id,surname, number from book.cutters LIMIT $1 OFFSET $2", filter.Limit, filter.Offset)

	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function(FORMAT_FUNC(RepoName, "Get")))
	}
	return table
}
func (repo *AuthorNumberRepository) Search(filter Filter) []model.AuthorNumber {
	var table []model.AuthorNumber = make([]model.AuthorNumber, 0)
	selectErr := repo.db.Select(&table, "SELECT id,surname, number from book.cutters WHERE LOWER(surname) LIKE $1 LIMIT $2 OFFSET $3", fmt.Sprint("%", filter.Keyword, "%"), filter.Limit, filter.Offset)

	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function(FORMAT_FUNC(RepoName, "Get")))
	}
	return table
}
func (repo *AuthorNumberRepository) GetGroupedArray() map[string][]map[string]interface{} {
	return repo.cutters.GroupedArray
}

func (repo *AuthorNumberRepository) GetGroupedObjects() map[string]map[string]int {
	return repo.cutters.GroupedObjects
}
func (repo *AuthorNumberRepository) GetDefaultArray() []map[string]interface{} {
	return repo.cutters.DefaultArray
}
func (repo *AuthorNumberRepository) GetByInitial(ch string) {

}
func (repo *AuthorNumberRepository) Generate(firstname string, lastname string) cutters.AuthorNumber {
	return repo.cutters.GenerateCutter(firstname, lastname)
}
func (repo *AuthorNumberRepository) GenerateByTitle(title string) cutters.AuthorNumber {
	return repo.cutters.GenerateCutterByTitle(title)
}

func NewAuthorNumberRepository(cutters *cutters.Cutters, db *sqlx.DB) AuthorNumberRepositoryInterface {
	return &AuthorNumberRepository{
		cutters: cutters,
		db:      db,
	}
}

type AuthorNumberRepositoryInterface interface {
	Get(filter Filter) []model.AuthorNumber
	Search(filter Filter) []model.AuthorNumber
	GetByInitial(ch string)
	Generate(firstname string, lastname string) cutters.AuthorNumber
	GenerateByTitle(title string) cutters.AuthorNumber
	GetGroupedArray() map[string][]map[string]interface{}
	GetGroupedObjects() map[string]map[string]int
	GetDefaultArray() []map[string]interface{}
}
