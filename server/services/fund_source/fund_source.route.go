package fundsrc

import (
	"slim-app/server/app/http/middlewares"
	"slim-app/server/repository"

	"github.com/gin-gonic/gin"
)

func FundSourceRoutes(router *gin.RouterGroup, repos *repository.Repositories) {
	var controllers FundSourceControllerInterface = NewFundSourceController(repos)
	router.GET("/", controllers.GetSources)
	router.POST("/", middlewares.ValidateBody[SourceBody], controllers.NewSource)
	router.PUT("/:id/", middlewares.ValidateBody[SourceBody], controllers.UpdateSource)
	router.DELETE("/:id/", controllers.DeleteSource)

}
