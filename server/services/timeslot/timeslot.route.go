package timeslot

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)


func TimeSlotRoutes(router * gin.RouterGroup){
	ctrler := NewTimeSlotProfileController()
	timeSlotCtrler := NewTimeSlotController()
	router.POST("/profiles", middlewares.BlockRequestFromClientApp, middlewares.ValidateBody[TimeSlotProfileBody], ctrler.NewProfile)
	router.GET("/profiles", middlewares.BlockRequestFromClientApp, ctrler.GetProfiles)
	router.PUT("/profiles/:id", middlewares.BlockRequestFromClientApp, middlewares.ValidateBody[TimeSlotProfileBody], ctrler.UpdateProfile)
	router.DELETE("/profiles/:id", middlewares.BlockRequestFromClientApp, ctrler.DeleteProfile)
	router.GET("/profiles/:id", middlewares.BlockRequestFromClientApp, ctrler.GetProfileById)
	router.POST("/profiles/:id/slots", middlewares.BlockRequestFromClientApp, middlewares.ValidateBody[TimeSlotBody], timeSlotCtrler.NewTimeSlot)
}