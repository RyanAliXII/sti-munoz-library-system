package timeslot

import "github.com/gin-gonic/gin"


type TimeSlot struct{}

type TimeSlotController interface{
	NewTimeSlot(ctx * gin.Context)
}
func(ctrler * TimeSlot)NewTimeSlot(ctx * gin.Context){
	
}