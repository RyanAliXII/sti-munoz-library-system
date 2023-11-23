package model


type Reservation struct {
	TimeSlotId string `json:"timeSlotId" db:"time_slot_id"`
	DateSlotId	string `json:"dateSlotId" db:"date_slot_id"`
	DeviceId string `json:"deviceId" db:"device_id"`
}
