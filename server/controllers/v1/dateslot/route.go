package dateslot

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

func DateSlotRoutes(router * gin.RouterGroup, services * services.Services){
	ctrler := NewDateSlotController(services)
	router.POST("", 
	middlewares.ValidatePermissions([]string{"DateSlot.Add"}, true),
	middlewares.ValidateBody[NewSlotBody], ctrler.NewSlot)
	router.GET("", 
	ctrler.GetSlots)
	router.DELETE("/:id",
	middlewares.ValidatePermissions([]string{"DateSlot.Delete"}, true), 
	ctrler.DeleteSlot, )
}