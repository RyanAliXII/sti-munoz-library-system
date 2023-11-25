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
	GetReservations()([]model.Reservation, error)
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
func (repo * Reservation)GetReservations()([]model.Reservation, error){
	reservations := make([]model.Reservation, 0)
	query := `
	SELECT reservation.id, reservation.date_slot_id, 
	reservation.time_slot_id, reservation.device_id, 
	reservation.account_id, 
	remarks,
	status_id,
	(reservation_status.description) as status,
	JSON_BUILD_OBJECT('id', account.id, 
	'givenName', account.given_name,
	'surname', account.surname, 
	'displayName',account.display_name,
	'email', account.email,
	'profilePicture', account.profile_picture
	) as client, 
	JSON_BUILD_OBJECT(
	'id', date_slot.id ,
	'date', date_slot.date
	) as date_slot,
	JSON_BUILD_OBJECT(
	'id', time_slot.id, 
	'startTime', time_slot.start_time,
	'endTime', time_slot.end_time,
	'profileId', time_slot.profile_id
	) as time_slot, 
	JSON_BUILD_OBJECT(
	'id', device.id, 
	'name', device.name,
	'description', device.description,
	'available', device.available
	) as device, 
	reservation.created_at 
	from services.reservation
	INNER JOIN services.date_slot on date_slot_id = date_slot.id
	INNER JOIN services.time_slot on time_slot_id = time_slot.id
	INNER JOIN services.device on device_id = device.id
	INNER JOIN system.account on reservation.account_id = account.id
	INNER JOIN services.reservation_status on status_id = reservation_status.id
	ORDER BY created_at desc
	`
	err := repo.db.Select(&reservations, query)
	if err != nil {
		return reservations, err
	}
	return reservations, nil
}