package ddc

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

func DDCRoutes(router *gin.RouterGroup, services * services.Services) {
	controller := NewDDCController(services)
	router.GET("/", 
	middlewares.BlockRequestFromClientApp,
	controller.GetDDC)
}
