package dateslot

import "github.com/gin-gonic/gin"

func DateSlotRoutes(router * gin.RouterGroup){
	ctrler := NewDateSlotController()
	router.GET("", ctrler.NewSlot)
}