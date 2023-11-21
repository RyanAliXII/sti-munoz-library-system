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
	GetDevices()([]model.Device, error)
	UpdateDevice(device model.Device) error
}
func NewDevice()DeviceRepository{
	return &Device{
		db: db.Connect(),
	}
}
func(repo * Device)NewDevice(device model.Device)(error){
	_, err := repo.db.Exec(`INSERT INTO services.device 
	(name, description, available)VALUES($1, $2, $3)`, device.Name, device.Description, device.Available)
	return err
}
func(repo * Device)GetDevices()([]model.Device, error){
	devices := make([]model.Device, 0)
	err := repo.db.Select(&devices, "SELECT id, name, description, available from services.device ORDER BY created_at desc")
	return devices, err
}

func (repo * Device)UpdateDevice(device model.Device)error{
	_, err := repo.db.Exec(`
	UPDATE services.device
	 SET name = $1, description = $2, available = $3 
	 WHERE id = $4 and deleted_at is null`, device.Name, device.Description, device.Available, device.Id)
	 return err
}


