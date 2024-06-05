package accessionnumber

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)


func AccessionNumberRoutes(router * gin.RouterGroup, services * services.Services){
	ctrler := NewAccessionNumberController(services)
	router.GET("", ctrler.GetAccessionNumbers)
}