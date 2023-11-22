package timeslot

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)


func TimeSlotRoutes(router * gin.RouterGroup){
	ctrler := NewTimeSlotProfileController()
	timeSlotCtrler := NewTimeSlotController()
	router.Use(middlewares.BlockRequestFromClientApp)
	router.POST("/profiles",  middlewares.ValidateBody[TimeSlotProfileBody], ctrler.NewProfile)
	router.GET("/profiles", ctrler.GetProfiles)
	router.PUT("/profiles/:id",  middlewares.ValidateBody[TimeSlotProfileBody], ctrler.UpdateProfile)
	router.DELETE("/profiles/:id",  ctrler.DeleteProfile)
	router.GET("/profiles/:id",ctrler.GetProfileById)
	router.POST("/profiles/:id/slots",  middlewares.ValidateBody[TimeSlotBody], timeSlotCtrler.NewTimeSlot)
	router.PUT("/profiles/:id/slots/:slotId",  middlewares.ValidateBody[TimeSlotBody], timeSlotCtrler.UpdateTimeSlot)
	router.DELETE("/profiles/:id/slots/:slotId", timeSlotCtrler.DeleteTimeSlot)
}