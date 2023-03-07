package fundsrc

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func FundSourceRoutes(router *gin.RouterGroup) {
	var controllers FundSourceControllerInterface = NewFundSourceController()
	router.GET("/", controllers.GetSources)
	router.POST("/", middlewares.ValidateBody[SourceBody], controllers.NewSource)
	router.PUT("/:id/", middlewares.ValidateBody[SourceBody], controllers.UpdateSource)
	router.DELETE("/:id/", controllers.DeleteSource)

}
