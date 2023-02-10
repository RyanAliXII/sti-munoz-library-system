package ddc

import (
	"slim-app/server/repository"

	"github.com/gin-gonic/gin"
)

func DDCRoutes(router *gin.RouterGroup, repos *repository.Repositories) {
	var controller DDCControllerInterface = NewDDCController(repos)
	router.GET("/", controller.GetDDC)
}
