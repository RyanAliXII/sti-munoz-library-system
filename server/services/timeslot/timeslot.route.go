package timeslot

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)


func TimeSlotRoutes(router * gin.RouterGroup){
	ctrler := NewTimeSlotProfileController()
	router.POST("/profile", middlewares.BlockRequestFromClientApp, middlewares.ValidateBody[TimeSlotProfileBody], ctrler.NewProfile)
}