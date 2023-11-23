package timeslot

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)


func TimeSlotRoutes(router* gin.RouterGroup){
	ctrler := NewTimeSlotProfileController()
	timeSlotCtrler := NewTimeSlotController()
	router.GET("/profiles/:id",ctrler.GetProfileById)
	privateRouter := router.Group("")
	privateRouter.Use(middlewares.BlockRequestFromClientApp)
	privateRouter.POST("/profiles",  middlewares.ValidateBody[TimeSlotProfileBody], ctrler.NewProfile)
	privateRouter.GET("/profiles", ctrler.GetProfiles)
	privateRouter.PUT("/profiles/:id",  middlewares.ValidateBody[TimeSlotProfileBody], ctrler.UpdateProfile)
	privateRouter.DELETE("/profiles/:id",  ctrler.DeleteProfile)
	privateRouter.POST("/profiles/:id/slots",  middlewares.ValidateBody[TimeSlotBody], timeSlotCtrler.NewTimeSlot)
	privateRouter.PUT("/profiles/:id/slots/:slotId",  middlewares.ValidateBody[TimeSlotBody], timeSlotCtrler.UpdateTimeSlot)
	privateRouter.DELETE("/profiles/:id/slots/:slotId", timeSlotCtrler.DeleteTimeSlot)
}