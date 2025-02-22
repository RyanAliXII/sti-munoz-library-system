package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	cutters "github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/cutters"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"

	"github.com/jmoiron/sqlx"
)

const (
	SEARCH_AUTHOR_NUMBERS = "AuthorNumberRepository.New"
	GET_AUTHOR_NUMBERS    = "AuthorNumberRepository.Get"
	DELETE_AUTHOR_NUMBER  = "AuthorNumberRepository.Delete"
	UPDATE_AUTHOR_NUMBER  = "AuthorNumberRepository.Update"
)

type AuthorNumber struct {
	cutters *cutters.Cutters
	db      *sqlx.DB
}

func (repo *AuthorNumber) Get(filter filter.Filter) []model.AuthorNumber {
	var table []model.AuthorNumber = make([]model.AuthorNumber, 0)
	selectErr := repo.db.Select(&table, "SELECT id,surname, number from catalog.cutter_sanborn LIMIT $1 OFFSET $2", filter.Limit, filter.Offset)

	if selectErr != nil {
		logger.Error(selectErr.Error(), applog.Function(GET_AUTHOR_NUMBERS), applog.Error("SelectErr"))
	}
	return table
}
func (repo *AuthorNumber) Search(filter filter.Filter) []model.AuthorNumber {
	var table []model.AuthorNumber = make([]model.AuthorNumber, 0)
	selectErr := repo.db.Select(&table, "SELECT id,surname, number from catalog.cutter_sanborn WHERE surname ILIKE $1 OR number ILIKE $1 LIMIT $2 OFFSET $3", fmt.Sprint("%", filter.Keyword, "%"), filter.Limit, filter.Offset)

	if selectErr != nil {
		logger.Error(selectErr.Error(), applog.Function(SEARCH_AUTHOR_NUMBERS), applog.Error("selectErr"))
	}
	return table
}


func NewAuthorNumberRepository(db * sqlx.DB) AuthorNumberRepository {

	return &AuthorNumber{
		cutters: cutters.NewCuttersTable(),
		db:      db,
	}
}

type AuthorNumberRepository interface {
	Get(filter.Filter) []model.AuthorNumber
	Search(filter.Filter) []model.AuthorNumber
}
