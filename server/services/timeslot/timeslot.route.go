package timeslot

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)


func TimeSlotRoutes(router * gin.RouterGroup){
	ctrler := NewTimeSlotProfileController()
	router.POST("/profiles", middlewares.BlockRequestFromClientApp, middlewares.ValidateBody[TimeSlotProfileBody], ctrler.NewProfile)
	router.GET("/profiles", middlewares.BlockRequestFromClientApp, ctrler.GetProfiles)
}