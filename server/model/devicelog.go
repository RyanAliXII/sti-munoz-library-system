package model

import "github.com/RyanAliXII/sti-munoz-library-system/server/app/db"

type DeviceLog struct {
	Id string `json:"id" db:"id"`
	AccountId string `json:"accountId" db:"account_id"`
	DeviceId string `json:"deviceId" db:"device_id"`
	LoggedOutAt  db.NullableTime `json:"loggedOutAt" db:"logged_out_at"`
	IsLoggedOut bool `json:"isLoggedOut" db:"is_logged_out"`
	Client AccountJSON  `json:"client" db:"client"`
	Device DeviceJSON `json:"device" db:"device"`
	CreatedAt db.NullableTime`json:"createdAt" db:"created_at"`
}