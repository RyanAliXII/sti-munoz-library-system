package dateslot

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)

func DateSlotRoutes(router * gin.RouterGroup){
	ctrler := NewDateSlotController()
	router.POST("", 
	middlewares.ValidatePermissions([]string{"DateSlot.Add"}, true),
	middlewares.ValidateBody[NewSlotBody], ctrler.NewSlot)
	router.GET("", 
	middlewares.ValidatePermissions([]string{"DateSlot.Read"}, true),
	ctrler.GetSlots)
	router.DELETE("/:id",
	middlewares.ValidatePermissions([]string{"DateSlot.Delete"}, true), 
	ctrler.DeleteSlot, )
}