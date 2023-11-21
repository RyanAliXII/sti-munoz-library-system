package timeslot


type TimeSlotProfileBody struct {
	Name string `json:"name" binding:"required,max=100"`
}