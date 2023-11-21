package timeslot

import "github.com/gin-gonic/gin"



type TimeSlotProfile struct {

}
func NewTimeSlotProfileController() TimeSlotProfileController {
	return &TimeSlotProfile{}
}
type TimeSlotProfileController interface {
	NewProfile(ctx * gin.Context)
	UpdateProfile(ctx * gin.Context)
	DeleteProfile(ctx * gin.Context)
	GetProfiles(ctx * gin.Context)
}
func(ctrler * TimeSlotProfile)NewProfile(ctx * gin.Context){

}
func(ctrler * TimeSlotProfile)UpdateProfile(ctx * gin.Context){

}
func(ctrler * TimeSlotProfile)DeleteProfile(ctx * gin.Context){

}
func(ctrler * TimeSlotProfile)GetProfiles(ctx * gin.Context){
	
}