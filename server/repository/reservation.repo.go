package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/status"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)



type Reservation struct {
	db * sqlx.DB
}
type ReservationRepository interface{
	NewReservation(model.Reservation) error 
	GetReservations()([]model.Reservation, error)
	MarkAsAttended(id string) error
	MarkAsMissed(id string) error
	CancelReservation(id string, remarks string) error
	GetReservationsByClientId(accountId string)([]model.Reservation, error)
	CancelReservationByClientAndId(id string, clientId string, remarks string) error
	GetReservationByClientAndDateSlot(clientId string, dateSlotId string) ([]model.Reservation, error)
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
	 (SELECT 1 from reservation_view
	  where 
	  date_slot_id = $1 
	  and time_slot_id = $2 
	  and account_id = $3 
	  and device_id = $4  and status_id = 1)`, 
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
	 (SELECT 1 from reservation_view
	  where 
	  date_slot_id = $1 
	  and time_slot_id = $2 
	  and account_id = $3  and status_id = 1)`,
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
	SELECT id, date_slot_id, 
	time_slot_id, device_id, 
	account_id, 
	remarks,
	status_id,
     status,
	 client, 
	 date_slot,
	 time_slot, 
	 device, 
	 created_at 
	 from reservation_view
	 ORDER BY created_at desc
	`
	err := repo.db.Select(&reservations, query)
	if err != nil {
		return reservations, err
	}
	return reservations, nil
}

func (repo * Reservation)GetReservationsByClientId(accountId string)([]model.Reservation, error){
	reservations := make([]model.Reservation, 0)
	query := `
	SELECT id, date_slot_id, 
	time_slot_id, device_id, 
	account_id, 
	remarks,
	status_id,
     status,
	 client, 
	 date_slot,
	 time_slot, 
	 device, 
	 created_at 
	 from reservation_view
	where account_id = $1
	ORDER BY created_at desc
	`
	err := repo.db.Select(&reservations, query, accountId)
	if err != nil {
		return reservations, err
	}
	return reservations, nil
}

func (repo * Reservation)MarkAsAttended(id string) error {
	_, err := repo.db.Exec(`UPDATE services.reservation 
	set status_id = $1 where id = $2 and (status_id = 1 OR status_id = 3)`, status.ReservationStatusAttended, id)
	return err
}
func (repo * Reservation)MarkAsMissed(id string) error {
	_, err := repo.db.Exec(`UPDATE services.reservation 
	set status_id = $1 where id = $2 and (status_id = 1 OR status_id = 2)`, status.ReservationStatusMissed, id)
	return err
}
func (repo * Reservation)CancelReservation(id string, remarks string) error {
	_, err := repo.db.Exec(`UPDATE services.reservation 
	set status_id = $1, remarks = $2  where id = $3 and (status_id = 1 OR status_id = 4)`, status.ReservationStatusCancelled, remarks, id)
	return err
}
func(repo * Reservation)CancelReservationByClientAndId(id string, clientId string, remarks string) error {
	_, err := repo.db.Exec(`UPDATE services.reservation 
	set status_id = $1, remarks = $2  where id = $3 and (status_id = 1) and account_id = $4`, status.ReservationStatusCancelled, remarks, id, clientId)
	return err
}
func(repo * Reservation)GetReservationByClientAndDateSlot(clientId string, dateSlotId string) ([]model.Reservation, error) {
	reservations := make([]model.Reservation, 0)
	query := `
	SELECT id, date_slot_id, 
	time_slot_id, device_id, 
	account_id, 
	remarks,
	status_id,
     status,
	 client, 
	 date_slot,	
	 time_slot, 
	 device, 
	 created_at 
	 from reservation_view
	where account_id = $1 and date_slot_id = $2 and status_id = 1
	ORDER BY created_at desc
	`
	err := repo.db.Select(&reservations, query, clientId, dateSlotId )
	if err != nil {
		return reservations, err
	}
	return reservations, nil
	
}