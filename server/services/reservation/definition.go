package reservation

type ReservationBody struct {
	TimeSlotId string `json:"timeSlotId" binding:"required"`
	DateSlotId	string `json:"dateSlotId" binding:"required"`
	DeviceId string `json:"deviceId" binding:"required"`
}