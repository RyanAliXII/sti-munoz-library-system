package model

import "github.com/RyanAliXII/sti-munoz-library-system/server/app/db"


type Reservation struct {
	TimeSlotId string `json:"timeSlotId" db:"time_slot_id"`
	DateSlotId	string `json:"dateSlotId" db:"date_slot_id"`
	DeviceId string `json:"deviceId" db:"device_id"`
	AccountId string `json:"accountId" db:"account_id"`
	Client AccountJSON `json:"client" db:"account"`
	DateSlot DateSlotJSON `json:"dateSlot" db:"date_slot"`
	TimeSlot TimeSlotJSON `json:"timeSlot" db:"time_slot"`
	CreatedAt db.NullableTime `json:"createdAt" db:"created_at"`
}
