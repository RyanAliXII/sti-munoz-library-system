package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
	"github.com/jmoiron/sqlx"
)

type DateSlot struct {
	db * sqlx.DB
}
func NewDateSlotRepository () DateSlotRepository {
	return &DateSlot{
		db: db.Connect(),
	}
}
type DateSlotRepository interface{
	NewSlots([]model.DateSlot) error
	GetSlots()([]model.DateSlot, error)
	DeleteSlot(id string) error 
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
	ds := dialect.Insert(goqu.T("date_slot").Schema("services")).Rows(records).Prepared(true)
	query, args, err := ds.ToSQL()
	fmt.Println(query)
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
	return slots, nil
}
func (repo * DateSlot)DeleteSlot(id string)error{
	return nil
}