package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
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
	NewSlot(model.DateSlot) error
	GetSlots()([]model.DateSlot, error)
	DeleteSlot(id string) error 
}
func (repo * DateSlot)NewSlot(dateSlot model.DateSlot) error {
	return nil
}
func (repo * DateSlot)GetSlots()([]model.DateSlot, error){
	slots := make([]model.DateSlot, 0)
	return slots, nil
}
func (repo * DateSlot)DeleteSlot(id string)error{
	return nil
}