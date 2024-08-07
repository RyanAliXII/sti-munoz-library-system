package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)


type TimeSlot struct {
	db * sqlx.DB
}
func NewTimeSlotRepository(db * sqlx.DB)TimeSlotRepository{
	return &TimeSlot{
		db: db,
	}
}
type TimeSlotRepository interface {
	NewSlot(model.TimeSlot) error
	GetSlots()([]model.TimeSlot, error)
	UpdateSlot(timeSlot model.TimeSlot)(error)
	DeleteSlot(timeSlot model.TimeSlot)(error)
	GetTimeSlotBasedOnDateAndDevice(profileId string, dateSlotId string, deviceId string)([]model.TimeSlot, error)
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
func (repo * TimeSlot)DeleteSlot(timeSlot model.TimeSlot)(error){
	_, err := repo.db.Exec(`UPDATE services.time_slot
	SET deleted_at = NOW()
	WHERE id = $1 AND profile_id = $2 AND deleted_at IS NULL`,  timeSlot.Id, timeSlot.ProfileId)
	return err
}
func(repo * TimeSlot)GetTimeSlotBasedOnDateAndDevice(profileId string, dateSlotId string, deviceId string)([]model.TimeSlot, error){
	slots := make([]model.TimeSlot, 0)
	err := repo.db.Select(&slots, `
	SELECT time_slot.id, to_char(time_slot.start_time, 'HH24:MI:SS') as start_time, to_char(time_slot.end_time, 'HH24:MI:SS') as end_time, COUNT(rv.id) as booked FROM services.time_slot 
	LEFT JOIN 
	reservation_view as rv on time_slot.id = rv.time_slot_id 
	and rv.status_id = 1 and device_id = $1 and date_slot_id = $2 
	where 
	time_slot.profile_id = $3 and deleted_at is null
	GROUP BY time_slot.id, time_slot.id, time_slot.start_time, time_slot.end_time
	ORDER BY time_slot.start_time ASC
	`,deviceId, dateSlotId, profileId)
	
	return slots, err
}