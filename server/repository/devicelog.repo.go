package repository

import "github.com/RyanAliXII/sti-munoz-library-system/server/model"



func (repo * Device) NewDeviceLog(log model.DeviceLog) error {
	_, err := repo.db.Exec("INSERT INTO services.device_log(account_id, device_id) VALUES($1, $2)", log.AccountId, log.DeviceId)
	return err
}