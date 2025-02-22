package dateslot

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

func DateSlotRoutes(router * gin.RouterGroup, services * services.Services){
	ctrler := NewDateSlotController(services)
	router.POST("", 
	services.PermissionValidator.Validate([]string{"DateSlot.Add"}, true),
	middlewares.ValidateBody[NewSlotBody], ctrler.NewSlot)
	router.GET("", 
	services.PermissionValidator.Validate([]string{"Device.Read"}, false),
	ctrler.GetSlots)
	router.DELETE("/:id",
	services.PermissionValidator.Validate([]string{"DateSlot.Delete"}, true), 
	ctrler.DeleteSlot, )
}