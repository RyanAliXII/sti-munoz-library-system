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
	SELECT (SELECT COUNT(*) FROM system.account) as accounts, 
		(SELECT COUNT(*) FROM get_accession_table() ) as books, 
		(SELECT COALESCE(SUM(amount),0) FROM circulation.penalty) as penalties,
		(SELECT COALESCE(SUM(amount),0) FROM circulation.penalty where penalty.settled_at is not null) as settled_penalties,
		(SELECT COALESCE(SUM(amount),0) FROM circulation.penalty where penalty.settled_at is null) as unsettled_penalties,
		(SELECT COUNT(*) FROM circulation.online_borrowed_book where status ='pending') as pending_books,
		(SELECT COUNT(*) FROM circulation.online_borrowed_book where status ='approved') as approved_books,
		(SELECT COUNT(*) FROM circulation.online_borrowed_book where status ='checked-out') + 
		(SELECT COUNT(*) FROM  circulation.borrowed_book where returned_at is null and cancelled_at is null and unreturned_at is null ) as checked_out_books,

		(SELECT COUNT(*) FROM circulation.online_borrowed_book where status ='returned') + 
		(SELECT COUNT(*) FROM  circulation.borrowed_book where returned_at is not null ) as returned_books,
		(SELECT COUNT(*) FROM circulation.online_borrowed_book where status ='unreturned') + 
		(SELECT COUNT(*) FROM  circulation.borrowed_book where unreturned_at is not null ) as unreturned_books,
		(SELECT COUNT(*) FROM circulation.online_borrowed_book where status ='cancelled') + 
		(SELECT COUNT(*) FROM  circulation.borrowed_book where cancelled_at is not null ) as cancelled_books`
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