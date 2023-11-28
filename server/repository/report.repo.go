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
	GenerateReport(start string, end string)(model.ReportData, error)
	GetGameLogsData(start string, end string)([]model.GameData, error)
	GetDeviceLogsData(start string, end string)([]model.DeviceData, error) 
	GetWalkInLogs(start string, end string)([]model.WalkInLog, error)
	GetBorrowedSection (start string, end string)([]model.BorrowedSection, error)
	
}

func (repo * Report)GenerateReport(start string, end string)(model.ReportData, error){
	data := model.ReportData{}
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
	) as avg_walk_ins,
	(
		
		SELECT COUNT(1) FROM borrowing.borrowed_book where status_id = 4 
		and date(borrowed_book.created_at at time zone 'PHT') between $1 and $2 
	) as borrowed_books,
	(
		
		SELECT COUNT(1) FROM borrowing.borrowed_book where status_id = 5 
		and date(borrowed_book.created_at at time zone 'PHT') between $1 and $2 
	) as unreturned_books
	`
	err := repo.db.Get(&data, query, start, end)
	return data,err

}
func (repo * Report)GetBorrowedSection (start string, end string)([]model.BorrowedSection, error) {
	borrowedSection := make([]model.BorrowedSection, 0)
	query := `
	SELECT  section.name, COUNT(1) as total  FROM borrowed_book_view as bv
	INNER JOIN catalog.book on bv.book_id = book.id
	INNER JOIN catalog.section on book.section_id = section.id
	where date(bv.created_at at time zone 'PHT') between $1 and $2 and bv.status_id = 4
	GROUP BY  section.name
	`
	err := repo.db.Select(&borrowedSection, query, start, end)
	return borrowedSection, err
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
func (repo * Report)GetDeviceLogsData(start string, end string)([]model.DeviceData, error){
	data := make([]model.DeviceData, 0)
	query := `
	SELECT device.name, COUNT(1) as total
	FROM services.reservation 
	INNER JOIN services.device on device_id = device.id
	where date(reservation.created_at at time zone 'PHT') between $1 and $2 and status_id = 2
	GROUP BY device_id,device.name ORDER BY COUNT(1) DESC
	`
	err := repo.db.Select(&data, query,start, end)
	return data, err
}

func (repo * Report)GetWalkInLogs(start string, end string)([]model.WalkInLog, error){
	logs := make([]model.WalkInLog, 0)
	query := `
	SELECT date(client_log.created_at at time zone 'PHT'), count(1) as walk_ins
	from system.client_log
	where date(client_log.created_at at time zone 'PHT')  between $1 and $2 
	GROUP BY date(client_log.created_at at time zone 'PHT')
	ORDER BY date(client_log.created_at at time zone 'PHT') asc
	`
	err := repo.db.Select(&logs, query, start, end)
	return logs, err
}