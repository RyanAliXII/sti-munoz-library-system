package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)

type Device struct {
	db * sqlx.DB
}

type DeviceRepository interface {
	NewDevice(model.Device)(error)
}
func NewDevice()DeviceRepository{
	return &Device{
		db: db.Connect(),
	}
}
func(repo * Device)NewDevice(device model.Device) (error){
	return nil
}



