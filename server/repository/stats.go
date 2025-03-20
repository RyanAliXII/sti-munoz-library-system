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

func (repo * Stats)GetMonthlyLogs()([]model.WalkInData, error){
	logs := make([]model.WalkInData, 0)
	query := `
	WITH cte_series as(
		SELECT date(d) as d from generate_series(date(now() at time zone 'PHT') - interval '1 MONTH',  date(now() at time zone 'PHT'), INTERVAL '1 day')  as d
	),
	cte_logs as (
		SELECT
			date(date_trunc('day', client_log.created_at at time zone 'PHT')) AS dt,
			account_view.type_id,
			count(1) AS walk_ins
		FROM
			system.client_log	
		INNER JOIN
			account_view ON client_log.client_id = account_view.id 
		
		WHERE
			date(client_log.created_at at time zone 'PHT') >= date(now() at time zone 'PHT') - interval '1 MONTH'
		-- Change the type_id based on the user type you're interested in
		GROUP BY
			dt,  account_view.type_id
	),
	cte_logs_series as (
		SELECT id, name, cte_series.d, COALESCE(cte_logs.walk_ins, 0) as walk_ins  
		FROM system.user_type CROSS JOIN cte_series
		LEFT JOIN cte_logs on  cte_series.d = cte_logs.dt and user_type.id = cte_logs.type_id
	)
	SELECT name as user_group, COALESCE(JSON_AGG(JSON_BUILD_OBJECT('date', cls.d, 'count', COALESCE(cls.walk_ins, 0))), '[]') as logs from cte_logs_series as cls GROUP BY id,name
	`
	err := repo.db.Select(&logs, query)
	return logs, err
}
func(repo * Stats)GetWeeklyLogs()([]model.WalkInData, error) {
	logs := make([]model.WalkInData, 0)
	query := `
	WITH cte_series as(
		SELECT date(d) as d from generate_series(date(now() at time zone 'PHT') - interval '1 WEEK',  date(now() at time zone 'PHT'), INTERVAL '1 day')  as d
	),
	cte_logs as (
		SELECT
			date(date_trunc('day', client_log.created_at at time zone 'PHT')) AS dt,
			account_view.type_id,
			count(1) AS walk_ins
		FROM
			system.client_log	
		INNER JOIN
			account_view ON client_log.client_id = account_view.id 
		
		WHERE
			date(client_log.created_at at time zone 'PHT') >= date(now() at time zone 'PHT') - interval '1 WEEK'
		-- Change the type_id based on the user type you're interested in
		GROUP BY
			dt,  account_view.type_id
	),
	cte_logs_series as (
		SELECT id, name, cte_series.d, COALESCE(cte_logs.walk_ins, 0) as walk_ins  
		FROM system.user_type CROSS JOIN cte_series
		LEFT JOIN cte_logs on  cte_series.d = cte_logs.dt and user_type.id = cte_logs.type_id
	)
	SELECT name as user_group, COALESCE(JSON_AGG(JSON_BUILD_OBJECT('date', cls.d, 'count', COALESCE(cls.walk_ins, 0))), '[]') as logs from cte_logs_series as cls GROUP BY id,name
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
	GetWeeklyLogs()([]model.WalkInData, error)
	GetMonthlyLogs()([]model.WalkInData, error) 
	GetWeeklyBorrowedSection ()([]model.BorrowedSection, error)
	GetMonthlyBorrowedSection ()([]model.BorrowedSection, error) 
}