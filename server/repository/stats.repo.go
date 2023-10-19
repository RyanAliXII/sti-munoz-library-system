package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)

type StatsRepository struct {
	db *sqlx.DB
}


func(repo * StatsRepository)GetLibraryStats()model.LibraryStats{
	var stats model.LibraryStats
	query := `
	SELECT
    (SELECT COUNT(1) FROM system.account) as accounts,
    (SELECT COUNT(1) FROM catalog.accession) as books,
    (SELECT COALESCE(SUM(amount), 0) FROM borrowing.penalty) as penalties,
    (SELECT COALESCE(SUM(amount), 0) FROM borrowing.penalty WHERE settled_at IS NOT NULL) as settled_penalties,
    (SELECT COALESCE(SUM(amount), 0) FROM borrowing.penalty WHERE settled_at IS NULL) as unsettled_penalties`
    getErr := repo.db.Get(&stats, query)
    if getErr != nil {
		logger.Error(getErr.Error(), slimlog.Function("StatsRepository.GetLibraryStats"), slimlog.Error("getErrd"))
    }
    return stats
}

func NewStatsRepository() StatsRepositoryInterface {
	db :=  postgresdb.GetOrCreateInstance()
	return &StatsRepository{db:db}
}


type StatsRepositoryInterface interface {
	GetLibraryStats()model.LibraryStats
}