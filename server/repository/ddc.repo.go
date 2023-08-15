package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
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
	selectErr := repo.db.Select(&deweys, "SELECT id, name, number from catalog.ddc where search_vector @@ (websearch_to_tsquery('english', $1) :: text || ':*' ) :: tsquery ORDER BY number ASC LIMIT $2 OFFSET $3",filter.Keyword, filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("DDCRepository.Get"))
	}
	return deweys
}

func NewDDCRepository() DDCRepositoryInterface {
	return &DDCRepository{
		db: postgresdb.GetOrCreateInstance(),
	}
}

type DDCRepositoryInterface interface {
	Get(filter * filter.Filter) []model.DDC
	Search (filter * filter.Filter)[]model.DDC
}
