package repository

import (
	"fmt"

	cutters "github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/cutters"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"

	"github.com/jmoiron/sqlx"
)

const (
	SEARCH_AUTHOR_NUMBERS = "AuthorNumberRepository.New"
	GET_AUTHOR_NUMBERS    = "AuthorNumberRepository.Get"
	DELETE_AUTHOR_NUMBER  = "AuthorNumberRepository.Delete"
	UPDATE_AUTHOR_NUMBER  = "AuthorNumberRepository.Update"
)

type AuthorNumberRepository struct {
	cutters *cutters.Cutters
	db      *sqlx.DB
}

func (repo *AuthorNumberRepository) Get(filter Filter) []model.AuthorNumber {
	var table []model.AuthorNumber = make([]model.AuthorNumber, 0)
	selectErr := repo.db.Select(&table, "SELECT id,surname, number from catalog.cutters LIMIT $1 OFFSET $2", filter.Limit, filter.Offset)

	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function(GET_AUTHOR_NUMBERS), slimlog.Error("SelectErr"))
	}
	return table
}
func (repo *AuthorNumberRepository) Search(filter Filter) []model.AuthorNumber {
	var table []model.AuthorNumber = make([]model.AuthorNumber, 0)
	selectErr := repo.db.Select(&table, "SELECT id,surname, number from catalog.cutters WHERE surname ILIKE $1 LIMIT $2 OFFSET $3", fmt.Sprint("%", filter.Keyword, "%"), filter.Limit, filter.Offset)

	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function(SEARCH_AUTHOR_NUMBERS), slimlog.Error("selectErr"))
	}
	return table
}
// func (repo *AuthorNumberRepository) GetGroupedArray() map[string][]map[string]interface{} {
// 	return repo.cutters.GroupedArray
// }

// func (repo *AuthorNumberRepository) GetGroupedObjects() map[string]map[string]int {
// 	return repo.cutters.GroupedObjects
// }
// func (repo *AuthorNumberRepository) GetDefaultArray() []map[string]interface{} {
// 	return repo.cutters.DefaultArray
// }

func (repo *AuthorNumberRepository) Generate(firstname string, lastname string) cutters.AuthorNumber {
	return repo.cutters.GenerateCutter(firstname, lastname)
}
func (repo *AuthorNumberRepository) GenerateByTitle(title string) cutters.AuthorNumber {
	return repo.cutters.GenerateCutterByTitle(title)
}

func NewAuthorNumberRepository() AuthorNumberRepositoryInterface {

	return &AuthorNumberRepository{
		cutters: cutters.NewCuttersTable(),
		db:      postgresdb.GetOrCreateInstance(),
	}
}

type AuthorNumberRepositoryInterface interface {
	Get(filter Filter) []model.AuthorNumber
	Search(filter Filter) []model.AuthorNumber
	Generate(firstname string, lastname string) cutters.AuthorNumber
	GenerateByTitle(title string) cutters.AuthorNumber
}
