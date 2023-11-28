package model

import "github.com/RyanAliXII/sti-munoz-library-system/server/app/db"


type Reservation struct {
	Id string `json:"id" db:"id"`
	TimeSlotId string `json:"timeSlotId" db:"time_slot_id"`
	DateSlotId	string `json:"dateSlotId" db:"date_slot_id"`
	DeviceId string `json:"deviceId" db:"device_id"`
	AccountId string `json:"accountId" db:"account_id"`
	Client AccountJSON `json:"client" db:"client"`
	DateSlot DateSlotJSON `json:"dateSlot" db:"date_slot"`
	TimeSlot TimeSlotJSON `json:"timeSlot" db:"time_slot"`
	StatusId int `json:"statusId" db:"status_id"`
	Status string `json:"status" db:"status"`
	Device DeviceJSON `json:"device" db:"device"`
	Remarks string `json:"remarks" db:"remarks"`
	CreatedAt db.NullableTime `json:"createdAt" db:"created_at"`
}
