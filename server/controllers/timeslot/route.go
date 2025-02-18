package timeslot

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)


func TimeSlotRoutes(router* gin.RouterGroup, services * services.Services){
	ctrler := NewTimeSlotProfileController(services)
	timeSlotCtrler := NewTimeSlotController(services)
	router.GET("/profiles/:id",ctrler.GetProfileById)
	router.GET("/profiles/:id/date-slots/:dateSlotId/devices/:deviceId", timeSlotCtrler.GetTimeSlotBasedOnDateAndDevice)
	privateRouter := router.Group("")

	privateRouter.POST("/profiles",  
	services.PermissionValidator.Validate([]string{"TimeSlot.Add"}, true),
	middlewares.ValidateBody[TimeSlotProfileBody], ctrler.NewProfile)

	privateRouter.GET("/profiles",
	services.PermissionValidator.Validate([]string{"TimeSlot.Read"}, true),
	ctrler.GetProfiles)

	privateRouter.PUT("/profiles/:id",  
	services.PermissionValidator.Validate([]string{"TimeSlot.Edit"}, true),
	middlewares.ValidateBody[TimeSlotProfileBody], ctrler.UpdateProfile)

	privateRouter.DELETE("/profiles/:id",  
	services.PermissionValidator.Validate([]string{"TimeSlot.Delete"}, true),
	ctrler.DeleteProfile)

	privateRouter.POST("/profiles/:id/slots",  
	services.PermissionValidator.Validate([]string{"TimeSlot.Add"}, true),
	middlewares.ValidateBody[TimeSlotBody], timeSlotCtrler.NewTimeSlot)
	
	privateRouter.PUT("/profiles/:id/slots/:slotId", 
	services.PermissionValidator.Validate([]string{"TimeSlot.Edit"}, true),
	middlewares.ValidateBody[TimeSlotBody], timeSlotCtrler.UpdateTimeSlot)
	
	privateRouter.DELETE("/profiles/:id/slots/:slotId", 
	services.PermissionValidator.Validate([]string{"TimeSlot.Delete"}, true),
	timeSlotCtrler.DeleteTimeSlot)
}