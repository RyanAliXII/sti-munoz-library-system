package dateslot

import "github.com/gin-gonic/gin"


type DateSlot struct {}
func NewDateSlotController () DateSlotController {
	return &DateSlot{}
}
type DateSlotController interface {
	NewSlot(ctx * gin.Context)
	DeleteSlot(ctx * gin.Context)
	GetSlots(ctx * gin.Context)
}
func (ctrler * DateSlot)NewSlot(ctx * gin.Context){

}
func (ctrler * DateSlot)DeleteSlot(ctx * gin.Context) {

}
func (ctrler * DateSlot)GetSlots(ctx * gin.Context){

}