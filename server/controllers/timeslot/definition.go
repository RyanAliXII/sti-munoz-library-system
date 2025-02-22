package timeslot

type TimeSlotProfileBody struct {
	Name string `json:"name" binding:"required,max=100"`
}
type TimeSlotBody struct {
	StartTime string `json:"startTime" binding:"required"`
	EndTime string `json:"endTime" binding:"required"`
}