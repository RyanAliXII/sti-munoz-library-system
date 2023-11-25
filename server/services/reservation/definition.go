package reservation

type ReservationBody struct {
	TimeSlotId string `json:"timeSlotId" binding:"required,uuid"`
	DateSlotId	string `json:"dateSlotId" binding:"required,uuid"`
	DeviceId string `json:"deviceId" binding:"required,uuid"`
}
type CancellationBody struct {
	Remarks string `json:"remarks"`
}