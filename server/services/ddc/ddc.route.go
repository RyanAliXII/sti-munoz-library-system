package ddc

import (
	"github.com/gin-gonic/gin"
)

func DDCRoutes(router *gin.RouterGroup) {
	var controller DDCControllerInterface = NewDDCController()
	router.GET("/", controller.GetDDC)
}
