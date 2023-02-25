package repository

import (
	"fmt"
	"slim-app/server/app/pkg/dewey"
	"slim-app/server/app/pkg/postgresdb"
	"slim-app/server/app/pkg/slimlog"

	"github.com/jmoiron/sqlx"
)

type DDCRepository struct {
	db *sqlx.DB
}

func (repo *DDCRepository) Get(filter Filter) []dewey.DeweyDecimal {
	var deweys []dewey.DeweyDecimal = make([]dewey.DeweyDecimal, 0)

	selectErr := repo.db.Select(&deweys, "SELECT name, number from catalog.ddc LIMIT $1 OFFSET $2", filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("DDCRepository.Get"))
	}
	return deweys
}
func (repo *DDCRepository) SearchByName(filter Filter) []dewey.DeweyDecimal {
	var deweys []dewey.DeweyDecimal = make([]dewey.DeweyDecimal, 0)
	selectErr := repo.db.Select(&deweys, "SELECT name, number from catalog.ddc WHERE name ILIKE $1 LIMIT $2 OFFSET $3", fmt.Sprint("%", filter.Keyword, "%"), filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("DDCRepository.Search"))
	}
	return deweys
}
func (repo *DDCRepository) SearchByNumber(filter Filter) []dewey.DeweyDecimal {
	var deweys []dewey.DeweyDecimal = make([]dewey.DeweyDecimal, 0)
	selectErr := repo.db.Select(&deweys, "SELECT name, number from catalog.ddc WHERE CAST( FLOOR(number) as INT) = $1  LIMIT $2 OFFSET $3", filter.Keyword, filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("DDCRepository.Search"))
	}
	return deweys
}
func NewDDCRepository() DDCRepositoryInterface {
	return &DDCRepository{
		db: postgresdb.GetOrCreateInstance(),
	}
}

type DDCRepositoryInterface interface {
	Get(filter Filter) []dewey.DeweyDecimal
	SearchByName(filter Filter) []dewey.DeweyDecimal
	SearchByNumber(filter Filter) []dewey.DeweyDecimal
}
