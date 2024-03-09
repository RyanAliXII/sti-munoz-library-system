package timeslot

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)


func TimeSlotRoutes(router* gin.RouterGroup){
	ctrler := NewTimeSlotProfileController()
	timeSlotCtrler := NewTimeSlotController()
	router.GET("/profiles/:id",ctrler.GetProfileById)
	router.GET("/profiles/:id/date-slots/:dateSlotId/devices/:deviceId", timeSlotCtrler.GetTimeSlotBasedOnDateAndDevice)
	privateRouter := router.Group("")

	privateRouter.POST("/profiles",  
	middlewares.ValidatePermissions([]string{"TimeSlot.Add"}, true),
	middlewares.ValidateBody[TimeSlotProfileBody], ctrler.NewProfile)

	privateRouter.GET("/profiles",
	middlewares.ValidatePermissions([]string{"TimeSlot.Read"}, true),
	ctrler.GetProfiles)

	privateRouter.PUT("/profiles/:id",  
	middlewares.ValidatePermissions([]string{"TimeSlot.Edit"}, true),
	middlewares.ValidateBody[TimeSlotProfileBody], ctrler.UpdateProfile)

	privateRouter.DELETE("/profiles/:id",  
	middlewares.ValidatePermissions([]string{"TimeSlot.Delete"}, true),
	ctrler.DeleteProfile)

	privateRouter.POST("/profiles/:id/slots",  
	middlewares.ValidatePermissions([]string{"TimeSlot.Add"}, true),
	middlewares.ValidateBody[TimeSlotBody], timeSlotCtrler.NewTimeSlot)
	
	privateRouter.PUT("/profiles/:id/slots/:slotId", 
	middlewares.ValidatePermissions([]string{"TimeSlot.Edit"}, true),
	middlewares.ValidateBody[TimeSlotBody], timeSlotCtrler.UpdateTimeSlot)
	
	privateRouter.DELETE("/profiles/:id/slots/:slotId", 
	middlewares.ValidatePermissions([]string{"TimeSlot.Delete"}, true),
	timeSlotCtrler.DeleteTimeSlot)
}