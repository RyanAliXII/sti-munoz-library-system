package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/jmoiron/sqlx"
)

type DateSlot struct {
	db * sqlx.DB
}
func NewDateSlotRepository (db *sqlx.DB) DateSlotRepository {
	return &DateSlot{
		db: db,
	}
}
type DateSlotRepository interface{
	NewSlots([]model.DateSlot) error
	GetSlots()([]model.DateSlot, error)
	DeleteSlot(id string) error 
	GetSlotsByRange(startDateStr string, endDateStr string)([]model.DateSlot, error)
}
func (repo * DateSlot)NewSlots(dateSlots []model.DateSlot) error {
	if(len(dateSlots) == 0){
		return nil
	}
	var records []goqu.Record = make([]goqu.Record, 0)
	for _, slot := range dateSlots {
		records = append(records, goqu.Record{
			"date": slot.Date,
			"profile_id": slot.ProfileId,
		})
	}
	dialect := goqu.Dialect("postgres")
	ds := dialect.Insert(goqu.T("date_slot").Schema("services")).Rows(records).Prepared(true).OnConflict(
		exp.NewDoUpdateConflictExpression("date", goqu.Record{
			"date": goqu.L("EXCLUDED.date"),
			"profile_id": goqu.L("EXCLUDED.profile_id"),
			"deleted_at": goqu.L("null"),}))
	query, args, err := ds.ToSQL()
	
	if err != nil {
		return err
	}
	_, err = repo.db.Exec(query, args...)
	if err != nil {
		return err
	}
	return nil
}
func (repo * DateSlot)GetSlots()([]model.DateSlot, error){
	slots := make([]model.DateSlot, 0)
	query := `
		SELECT ds.id, 
		ds.date,
		ds.profile_id,
		JSON_BUILD_OBJECT('id', tsp.id, 'name', tsp.name) as time_slot_profile
		FROM services.date_slot as ds
		INNER JOIN services.time_slot_profile as tsp on ds.profile_id = tsp.id
		where ds.deleted_at is null ORDER BY ds.date asc
	`
	err := repo.db.Select(&slots, query)
	return slots, err
}

func (repo * DateSlot)GetSlotsByRange(startDateStr string, endDateStr string)([]model.DateSlot, error){
	slots := make([]model.DateSlot, 0)
	query := `
		SELECT ds.id, 
		ds.date::date,
		ds.profile_id,
		JSON_BUILD_OBJECT('id', tsp.id, 'name', tsp.name) as time_slot_profile
		FROM services.date_slot as ds
		INNER JOIN services.time_slot_profile as tsp on ds.profile_id = tsp.id
		where ds.deleted_at is null  and date between $1 and $2  ORDER BY ds.date asc
	`
	err := repo.db.Select(&slots, query, startDateStr, endDateStr)
	return slots, err
}
func (repo * DateSlot)DeleteSlot(id string)error{
	_, err := repo.db.Exec("UPDATE services.date_slot set deleted_at = now() where id = $1", id)
	return err
}