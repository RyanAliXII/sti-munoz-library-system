package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)


type TimeSlot struct {
	db * sqlx.DB
}
func NewTimeSlotRepository()TimeSlotRepository{
	return &TimeSlot{
		db: db.Connect(),
	}
}
type TimeSlotRepository interface {
	NewSlot(model.TimeSlot) error
	GetSlots()([]model.TimeSlot, error)
	UpdateSlot(timeSlot model.TimeSlot)(error)
}
func (repo * TimeSlot)NewSlot(slot model.TimeSlot) error {
	_, err := repo.db.Exec("INSERT INTO services.time_slot(start_time, end_time, profile_id)VALUES($1, $2, $3)",
	slot.StartTime, slot.EndTime, slot.ProfileId)
	return err
}
func (repo * TimeSlot)GetSlots()([]model.TimeSlot, error) {
	slots := make([]model.TimeSlot, 0)
	err := repo.db.Select(&slots, "SELECT id, start_time, end_time, profile_id from services.time_slot")
	return  slots, err
}
func (repo * TimeSlot)UpdateSlot(timeSlot model.TimeSlot)(error){
	_, err := repo.db.Exec(`UPDATE services.time_slot 
	SET start_time = $1, end_time = $2 WHERE id = $3 and profile_id = $4 and deleted_at is null`, 
	timeSlot.StartTime, timeSlot.EndTime, timeSlot.Id, timeSlot.ProfileId)
	return err
}