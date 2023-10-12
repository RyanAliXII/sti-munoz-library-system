package ddc

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)

func DDCRoutes(router *gin.RouterGroup) {
	var controller DDCControllerInterface = NewDDCController()
	router.GET("/", 
	middlewares.BlockRequestFromClientApp,
	controller.GetDDC)
}
