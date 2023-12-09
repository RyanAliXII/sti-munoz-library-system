package model

import "github.com/RyanAliXII/sti-munoz-library-system/server/app/db"

type DeviceLog struct {
	Id string `json:"id" db:"id"`
	AccountId string `json:"accountId" db:"account_id"`
	DeviceId string `json:"deviceId" db:"device_id"`
	LoggedOutAt string `json:"loggedOutAt" db:"logged_out_at"` 
	CreatedAt db.NullableTime`json:"createdAt" db:"created_at"`
}