package routes

import (
	"slim-app/server/controllers"

	"github.com/gin-gonic/gin"
)

func FundSourceRoutes(router *gin.RouterGroup, ctlers *controllers.ControllersV1) {

	router.GET("/", ctlers.FundSourceController.GetSources)
	router.POST("/", ctlers.FundSourceController.NewSource)
}
