package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/status"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/jmoiron/sqlx"
)
type Reservation struct {
	db * sqlx.DB
}
type ReservationFilter struct {
	From string
	To string
    Status []int
	Devices []string
	SortBy string 
	Order string 
	filter.Filter
}
type ReservationRepository interface{
	NewReservation(model.Reservation) error 
	GetReservations(filter * ReservationFilter)([]model.Reservation, Metadata, error)
	MarkAsAttended(id string) error
	MarkAsMissed(id string) error
	CancelReservation(id string, remarks string) error
	GetReservationsByClientId(accountId string)([]model.Reservation, error)
	CancelReservationByClientAndId(id string, clientId string, remarks string) error
	GetReservationByClientAndDateSlot(clientId string, dateSlotId string) ([]model.Reservation, error)
	UpdateRemarks(id string, remarks string) error 
}
func NewReservationRepository(db * sqlx.DB) ReservationRepository{
	return &Reservation{
		db: db,
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
	hasExistingReservationWithDifferentDeviceButSameTimeSlot := true
	err = transaction.Get(&hasExistingReservationWithDifferentDeviceButSameTimeSlot, `
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
	if 	hasExistingReservationWithDifferentDeviceButSameTimeSlot {
		transaction.Rollback()
		return fmt.Errorf("has reservation with same timeslot but different device")
	}
	maxUniqueDeviceReservation := 0
	query := `SELECT account.max_unique_device_reservation_per_day FROM account_view as account where id = $1 LIMIT 1`
    err = repo.db.Get(&maxUniqueDeviceReservation, query, reservation.AccountId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	totalReservedByDeviceAndDate := 0
	query = `SELECT COUNT(1) FROM reservation_view where device_id = $1 and date_slot_id = $2`
	err = repo.db.Get(&totalReservedByDeviceAndDate, query, reservation.DeviceId, reservation.DateSlotId )	
	if err != nil {
		transaction.Rollback()
		return err
	}
	if(totalReservedByDeviceAndDate >= maxUniqueDeviceReservation){
		transaction.Rollback()
		return fmt.Errorf("you have met the maximum number of reservation per device and date")
	}
	query = `INSERT INTO services.reservation(date_slot_id, time_slot_id, account_id, device_id) VALUES($1, $2, $3, $4)`
	_, err = transaction.Exec(query, reservation.DateSlotId, reservation.TimeSlotId, reservation.AccountId, reservation.DeviceId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	transaction.Commit()
	return nil
	
}
func (repo * Reservation)GetReservations(filter * ReservationFilter)([]model.Reservation, Metadata, error){
	meta := Metadata{}
	reservations := make([]model.Reservation, 0)
	dialect := goqu.Dialect("postgres")
	ds := dialect.Select(goqu.C("id"),
	 goqu.C("date_slot_id"),
	  goqu.C("time_slot_id"), 
	  goqu.C("device_id"),
	  goqu.C("account_id"),
	  goqu.C("remarks"),
	  goqu.C("status_id"),
	  goqu.C("status"),
	  goqu.C("client"),
	  goqu.C("date_slot"),
	  goqu.C("time_slot"),
	  goqu.C("device"),
	  goqu.C("created_at"),
	).From(goqu.T("reservation_view")).Order(exp.NewOrderedExpression(goqu.C("created_at"), exp.DescSortDir, exp.NullsLastSortType))
	ds.Limit(uint(filter.Limit)).
	Offset(uint(filter.Offset))

	query, args, err := ds.ToSQL()
	if err != nil {
		return nil, meta, err
	}
	err = repo.db.Select(&reservations, query, args...)
	if err != nil {
		return reservations,meta, err
	}
	
	metadataDs  := repo.buildMetadataQuery(filter)
	query, args, err = metadataDs.ToSQL()
	if err != nil {
		return reservations, meta, err
	}
	err = repo.db.Get(&meta, query, args...)
	if err != nil {
		return reservations, meta, err
	}
	return reservations,meta ,nil
}
func (repo * Reservation)buildMetadataQuery(filter * ReservationFilter) (*goqu.SelectDataset){
	dialect := goqu.Dialect("postgres")	
	ds := dialect.Select(
		goqu.Case().When(goqu.COUNT(1).Eq(0), 0).Else(goqu.L("Ceil((COUNT(1)/?::numeric))::bigint", filter.Limit)).As("pages"),
		goqu.COUNT(1).As("records"),
	).From(goqu.T("reservation_view"))
	// ds = repo.buildClientLogFilters(ds, filter)
	return ds
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

func (repo * Reservation)UpdateRemarks(id string, remarks string) error {
	_, err := repo.db.Exec(`UPDATE services.reservation 
	set remarks = $1  where id = $2 `, remarks, id)
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