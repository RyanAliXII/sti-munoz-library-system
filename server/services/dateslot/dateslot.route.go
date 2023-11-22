package dateslot

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)

func DateSlotRoutes(router * gin.RouterGroup){
	ctrler := NewDateSlotController()
	router.POST("", middlewares.ValidateBody[NewSlotBody], ctrler.NewSlot)
	router.GET("", ctrler.GetSlots)
	router.DELETE("/:id", ctrler.DeleteSlot)
}