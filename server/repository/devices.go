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
	DeleteDevice(id string )error
	GetDeviceById(id string) (model.Device, error)
	NewDeviceLog(log model.DeviceLog) error 
	GetDeviceLogs(*DeviceLogFilter) ([]model.DeviceLog, Metadata, error)
	DeviceLogout(id string) error 
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
	err := repo.db.Select(&devices, "SELECT id, name, description, available from services.device where deleted_at is null ORDER BY created_at desc")
	return devices, err
}

func (repo * Device)UpdateDevice(device model.Device)error{
	_, err := repo.db.Exec(`
	UPDATE services.device
	 SET name = $1, description = $2, available = $3 
	 WHERE id = $4 and deleted_at is null`, device.Name, device.Description, device.Available, device.Id)
	 return err
}

func (repo * Device)DeleteDevice(id string )error{
	_, err := repo.db.Exec(`
	UPDATE services.device
	 SET deleted_at = now()
	 WHERE id = $1 and deleted_at is null`, id)
	 return err
}
func (repo * Device)GetDeviceById(id string) (model.Device, error){
	device := model.Device{}
	err := repo.db.Get(&device,"SELECT id, name, description, available from services.device where deleted_at is null and id = $1 LIMIT 1", id)
	return device, err
}




