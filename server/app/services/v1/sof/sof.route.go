package sof

import (
	"slim-app/server/app/http/middlewares"
	"slim-app/server/app/repository"

	"github.com/gin-gonic/gin"
)

func FundSourceRoutes(router *gin.RouterGroup, repos *repository.Repositories) {
	var controllers SOFInterface = &SOFController{repos: repos}
	router.GET("/", controllers.GetSources)
	router.POST("/", middlewares.ValidateBody[SourceBody], controllers.NewSource)
	router.PUT("/:id/", middlewares.ValidateBody[SourceBody], controllers.UpdateSource)
	router.DELETE("/:id/", controllers.DeleteSource)

}
