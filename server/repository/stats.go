package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)

type Stats struct {
	db *sqlx.DB
}

func(repo * Stats)GetLibraryStats()model.LibraryStats{
	var stats model.LibraryStats
	query := `
	SELECT
    (SELECT COUNT(1) FROM account_view where is_active) as accounts,
    (SELECT COUNT(1) FROM catalog.accession INNER JOIN catalog.book on accession.book_id = book.id and book.deleted_at is null where accession.weeded_at is null and accession.missing_at is null and accession.deleted_at is null) as books,
    (SELECT COALESCE(SUM(amount), 0) FROM borrowing.penalty) as penalties,
    (SELECT COALESCE(SUM(amount), 0) FROM borrowing.penalty WHERE settled_at IS NOT NULL) as settled_penalties,
    (SELECT COALESCE(SUM(amount), 0) FROM borrowing.penalty WHERE settled_at IS NULL) as unsettled_penalties`
    getErr := repo.db.Get(&stats, query)
    if getErr != nil {
		logger.Error(getErr.Error(), applog.Function("StatsRepository.GetLibraryStats"), applog.Error("getErrd"))
    }
    return stats
}

func (repo * Stats)GetMonthlyLogs()([]model.WalkInLog, error){
	logs := make([]model.WalkInLog, 0)
	query := `
	SELECT date(client_log.created_at at time zone 'PHT'), count(1) as walk_ins
	from system.client_log
	where date(client_log.created_at at time zone 'PHT') >= date(now() at time zone 'PHT') - interval '1 MONTH'
	GROUP BY date(client_log.created_at at time zone 'PHT')
	ORDER BY date(client_log.created_at at time zone 'PHT') asc
	`
	err := repo.db.Select(&logs, query)
	return logs, err
}
func(repo * Stats)GetWeeklyLogs()([]model.WalkInLog, error) {
	logs := make([]model.WalkInLog, 0)
	query := `
	SELECT date(client_log.created_at at time zone 'PHT'), count(1) as walk_ins
	from system.client_log
	where date(client_log.created_at at time zone 'PHT') >= date(now() at time zone 'PHT') - interval '1 WEEK'
	GROUP BY date(client_log.created_at at time zone 'PHT')
	ORDER BY date(client_log.created_at at time zone 'PHT') asc
	`
	err := repo.db.Select(&logs, query)
	return logs, err
}
func (repo * Stats)GetWeeklyBorrowedSection ()([]model.BorrowedSection, error) {
	borrowedSection := make([]model.BorrowedSection, 0)
	query := `
	SELECT  section.name, COUNT(1) as total  FROM borrowed_book_view as bv
	INNER JOIN catalog.book on bv.book_id = book.id
	INNER JOIN catalog.section on book.section_id = section.id
	where date(bv.created_at at time zone 'PHT') >= date(now() at time zone 'PHT') - interval '1 WEEK' and status_id = 4
	GROUP BY  section.name
	`
	err := repo.db.Select(&borrowedSection, query)
	return borrowedSection, err
}

func (repo * Stats)GetMonthlyBorrowedSection ()([]model.BorrowedSection, error) {
	borrowedSection := make([]model.BorrowedSection, 0)
	query := `
	SELECT  section.name, COUNT(1) as total  FROM borrowed_book_view as bv
	INNER JOIN catalog.book on bv.book_id = book.id
	INNER JOIN catalog.section on book.section_id = section.id
	where date(bv.created_at at time zone 'PHT') >= date(now() at time zone 'PHT') - interval '1 MONTH' and status_id = 4
	GROUP BY  section.name
	`
	err := repo.db.Select(&borrowedSection, query)
	return borrowedSection, err
}
func NewStatsRepository(db * sqlx.DB) StatsRepository {
	return &Stats{db:db}
}


type StatsRepository interface {
	GetLibraryStats()model.LibraryStats
	GetWeeklyLogs()([]model.WalkInLog, error)
	GetMonthlyLogs()([]model.WalkInLog, error) 
	GetWeeklyBorrowedSection ()([]model.BorrowedSection, error)
	GetMonthlyBorrowedSection ()([]model.BorrowedSection, error) 
}