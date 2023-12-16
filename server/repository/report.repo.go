package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)


type Report struct {
	db *sqlx.DB
}
func NewReportRepository() ReportRepository {
	return &Report{
		db: db.Connect(),
	}
}
type ReportRepository interface{
	GetClientStats(start string, end string)(model.ClientStatsData, error)
	GetGameLogsData(start string, end string)([]model.GameData, error)
	GetDeviceLogsData(start string, end string)([]model.DeviceData, error) 
	GetWalkInLogs(start string, end string)([]model.WalkInLog, error)
	GetWalkIns(from string, to string, frequency string)([]model.WalkInData, error)
	GetBorrowedSection (start string, end string)([]model.BorrowedSection, error)
	GetBorrowingReportData(start string, end string)(model.ReportData, error) 
	GetBorrowedBooks(start string, end string)([]model.BorrowedBook, error)
	GetGameLogs(start string, end string)([]model.GameLog, error)
	GetDeviceReservationData(start string, end string)([]model.DeviceData, error)
	GetDeviceLogs(start string, end string)([]model.DeviceLogReport, error)
}

func (repo * Report)GetClientStats(start string, end string)(model.ClientStatsData, error){
	data := model.ClientStatsData{}
	query := `
	SELECT (
		SELECT COUNT(1) 
		from system.client_log
		where date(client_log.created_at at time zone 'PHT') between $1 and $2 
	) as walk_ins,

	(
		SELECT AVG(occurence)::int FROM (
		SELECT COUNT(1)  as occurence
		from system.client_log
		where date(client_log.created_at at time zone 'PHT') between $1 and $2 
		GROUP BY date(client_log.created_at at time zone 'PHT')
		) as walkins_per_day
	) as avg_walk_ins
	`
	err := repo.db.Get(&data, query, start, end)
	return data,err

}
func (repo * Report)GetBorrowingReportData(start string, end string)(model.ReportData, error) {
	data := model.ReportData{}
	query := `SELECT (
		SELECT COUNT(1) from borrowed_book_all_view as bbav where (status_id = 4 or status_id = 3) 
		and date( bbav .created_at at time zone 'PHT') between $1 and $2 
	) as borrowed_books,
	(
		SELECT COUNT(1) from borrowed_book_all_view  as bbav where (status_id = 6)
		and date(bbav.created_at at time zone 'PHT') between $1 and $2 
	) as unreturned_books`
	err := repo.db.Get(&data, query, start, end)
	return data,err
}
func (repo * Report)GetBorrowedSection (start string, end string)([]model.BorrowedSection, error) {
	borrowedSection := make([]model.BorrowedSection, 0)
	query := `
	SELECT  section.name, COUNT(1) as total  FROM borrowed_book_all_view as bv
	INNER JOIN catalog.book on bv.book_id = book.id
	INNER JOIN catalog.section on book.section_id = section.id
	where date(bv.created_at at time zone 'PHT') between $1 and $2 and (bv.status_id = 4 or bv.status_id = 3)
	GROUP BY  section.name
	`
	err := repo.db.Select(&borrowedSection, query, start, end)
	return borrowedSection, err
}

func(repo *Report)GetWalkIns(from string, to string, frequency string)([]model.WalkInData, error){
	data := make([]model.WalkInData, 0)
	query := `
	WITH cte_series as(
		SELECT date(d) as d from generate_series($1, $2, INTERVAL '1 day')  as d
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
			date(client_log.created_at at time zone 'PHT') BETWEEN $1 AND $2
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
	err := repo.db.Select(&data, query, from, to)
	
	return  data, err
}
func (repo * Report)GetBorrowedBooks(start string, end string)([]model.BorrowedBook, error) {
	borrowedBooks := make([]model.BorrowedBook, 0) 
	query := `SELECT id, group_id, client, account_id, book, status, status_id, accession_id, number, copy_number, penalty, due_date, remarks, is_ebook, created_at 
	FROM borrowed_book_all_view where date(created_at at time zone 'PHT') between $1 and $2 and (status_id = 3 or status_id = 4) order by created_at asc`
	err := repo.db.Select(&borrowedBooks, query, start, end)
	return borrowedBooks, err
}


func (repo *Report) GetGameLogsData(start string, end string)([]model.GameData, error) {

	data := make([]model.GameData, 0)
	query := `
	SELECT game.name, COUNT(1) as total FROM services.game_log
	INNER JOIN services.game on game_id = game.id
	where date(game_log.created_at at time zone 'PHT') between $1 and $2
	GROUP BY game_id,game.name ORDER BY COUNT(1) DESC
	`
	err := repo.db.Select(&data, query,start, end)
	return data, err
}
func (repo * Report)GetGameLogs(start string, end string)([]model.GameLog, error){
	gameLogs := make([]model.GameLog, 0)
	query := `
	SELECT "game_log"."id", "game_id", "logged_out_at", (CASE WHEN logged_out_at IS NULL THEN FALSE ELSE TRUE END) AS "is_logged_out", 
	account.json_format AS "client", 
	json_build_object(
	  'id', game.id, 
	  'name', game.name, 
	  'description', game.description
	) AS "game", 
	"game_log"."created_at" 
	FROM "services"."game_log" 
	INNER JOIN "account_view" AS account ON ("game_log"."account_id" = "account"."id") 
	INNER JOIN "services"."game" ON ("game_log"."game_id" = "game"."id") 
	WHERE DATE(game_log.created_at AT TIME ZONE 'PHT') BETWEEN $1 AND $2
	ORDER BY "game_log"."created_at";
	`
	err := repo.db.Select(&gameLogs, query, start, end)
	return gameLogs, err
}
func (repo * Report)GetDeviceReservationData(start string, end string)([]model.DeviceData, error){
	data := make([]model.DeviceData, 0)
	query := `
	SELECT device.name, COUNT(1) as total
	FROM services.reservation 
	INNER JOIN services.device on device_id = device.id
	where date(reservation.created_at at time zone 'PHT') between $1 and $2
	GROUP BY device_id,device.name ORDER BY COUNT(1) DESC
	`
	err := repo.db.Select(&data, query,start, end)
	return data, err
}
func (repo * Report)GetDeviceLogsData(start string, end string)([]model.DeviceData, error){
	data := make([]model.DeviceData, 0)
	query := `
	WITH cte_device_logs as  (
		SELECT device.id,device.name, COUNT(1) as total
		FROM services.device_log
		INNER JOIN services.device on device_id = device.id
		where date(device_log.created_at at time zone 'PHT') between $1 and $2
		GROUP BY device.id, device_id,device.name ORDER BY COUNT(1) DESC
	),
	cte_reservations as (SELECT device.id, device.name, COUNT(1) as total
	FROM services.reservation 
	INNER JOIN services.device on device_id = device.id
	where date(reservation.created_at at time zone 'PHT') between $1 and $2
	GROUP BY device.id,device_id,device.name ORDER BY COUNT(1) DESC)
	
	SELECT device.name, (cdl.total + ctr.total) as total FROM services.device
		LEFT JOIN cte_device_logs as cdl on  device.id = cdl.id
		LEFT JOIN cte_reservations as ctr on device.id = ctr.id
	`
	err := repo.db.Select(&data, query,start, end)
	return data, err
}


func (repo * Report)GetWalkInLogs(start string, end string)([]model.WalkInLog, error){
	logs := make([]model.WalkInLog, 0)
	query := `
	SELECT
    date_trunc('day', client_log.created_at at time zone 'PHT') AS week,
   
    count(1) AS walk_ins_weekly
FROM
    system.client_log
INNER JOIN
    account_view ON client_log.client_id = account_view.id 
WHERE
    date(client_log.created_at at time zone 'PHT') BETWEEN '2023-11-01' AND '2023-12-01'
    AND account_view.type_id = 2 
GROUP BY
    week,  account_view.type_id
ORDER BY
    week ASC;
	`
	err := repo.db.Select(&logs, query, start, end)
	return logs, err
}
func(repo * Report)GetDeviceLogs(start string, end string)([]model.DeviceLogReport, error){
	deviceLogReports := make([]model.DeviceLogReport,0)
	query := `
	WITH cte_device_logs as (
		(SELECT client, device, CONCAT(reservation_date,' ', reservation_time)::timestamp as event_time FROM reservation_view
		UNION ALL
		SELECT account.json_format as client, jsonb_build_object(
					'id',device.id, 
					'name', device.name, 
					'available', device.available,
					'description', device.description) as device, (device_log.created_at at time zone 'PHT')  as event_time FROM services.device_log 
		INNER JOIN services.device on device_log.device_id = device.id
		INNER JOIN account_view as account on device_log.account_id = account.id)
		
		)
		SELECT * FROM cte_device_logs where date(event_time) between $1 and $2	order by event_time asc
	`
	err := repo.db.Select(&deviceLogReports, query, start, end)
	return deviceLogReports, err 
}