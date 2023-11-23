package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)



type Reservation struct {
	db * sqlx.DB
}
type ReservationRepository interface{
	NewReservation(model.Reservation) error 
}
func NewReservationRepository() ReservationRepository{
	return &Reservation{
		db: db.Connect(),
	}
}
func(repo * Reservation)NewReservation(reservation model.Reservation) error {
	transaction , err := repo.db.Beginx()
	
	if err != nil {
		transaction.Rollback()
		return err
	}
	hasExistingReservation := true
	err = transaction.Get(&hasExistingReservation, `
	  SELECT
	  EXISTS 
	 (SELECT 1 from services.reservation 
	  where 
	  date_slot_id = $1 
	  and time_slot_id = $2 
	  and account_id = $3 
	  and device_id = $4 )`, 
	reservation.DateSlotId, reservation.TimeSlotId, reservation.AccountId, reservation.DeviceId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	if hasExistingReservation {
		transaction.Rollback()
		return fmt.Errorf("reservation already exists")
	}
	hasExistingReservationWithDifferentDevice := true
	err = transaction.Get(&hasExistingReservationWithDifferentDevice, `
	  SELECT
	  EXISTS 
	 (SELECT 1 from services.reservation 
	  where 
	  date_slot_id = $1 
	  and time_slot_id = $2 
	  and account_id = $3)`,
	reservation.DateSlotId, reservation.TimeSlotId, reservation.AccountId)

	if err != nil {
		transaction.Rollback()
		return err
	}
	if hasExistingReservationWithDifferentDevice {
		transaction.Rollback()
		return fmt.Errorf("has reservation with same timeslot but different device")
	} 
	
	query := `INSERT INTO services.reservation(date_slot_id, time_slot_id, account_id, device_id) VALUES($1, $2, $3, $4)`
	_, err = transaction.Exec(query, reservation.DateSlotId, reservation.TimeSlotId, reservation.AccountId, reservation.DeviceId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	transaction.Commit()
	return nil
	
}
