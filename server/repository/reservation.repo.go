package repository

import (
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
	return nil
}
