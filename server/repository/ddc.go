package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)

//DDC stands for Dewey Decimal
type DDCRepository struct {
	db *sqlx.DB
}

func (repo *DDCRepository) Get(filter  * filter.Filter ) []model.DDC {
	var deweys []model.DDC = make([]model.DDC, 0)
	selectErr := repo.db.Select(&deweys, "SELECT id, name, number from catalog.ddc ORDER BY number ASC LIMIT $1 OFFSET $2", filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("DDCRepository.Get"))
	}
	return deweys
}
func (repo * DDCRepository) Search (filter * filter.Filter)[]model.DDC {
	var deweys []model.DDC = make([]model.DDC, 0)
	selectErr := repo.db.Select(&deweys, `
	SELECT id, name, number
	FROM catalog.ddc
	WHERE search_vector @@ (
	  CASE
		WHEN length((websearch_to_tsquery('english', $1)::text)) > 0 THEN
				(websearch_to_tsquery('english', $1)::text || ':*')::tsquery
		ELSE
				websearch_to_tsquery('english', $1) :: tsquery
	  END)  
	  ORDER BY number ASC LIMIT $2 OFFSET $3`,filter.Keyword, filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("DDCRepository.Get"))
	}
	return deweys
}

func NewDDCRepository(db * sqlx.DB) DDCRepositoryInterface {
	return &DDCRepository{
		db: db,
	}
}

type DDCRepositoryInterface interface {
	Get(filter * filter.Filter) []model.DDC
	Search (filter * filter.Filter)[]model.DDC
}
