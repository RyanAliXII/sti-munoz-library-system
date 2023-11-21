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
}
func (repo * TimeSlot)NewSlot(slot model.TimeSlot) error {
	return nil
}