package ddc

import (
	"slim-app/server/app/repository"

	"github.com/gin-gonic/gin"
)

func DDCRoutes(router *gin.RouterGroup, repos *repository.Repositories) {
	var controller DDCControllerInterface = &DDCController{
		repos: repos,
	}
	router.GET("/", controller.GetDDC)
}
