package fundsrc

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func FundSourceRoutes(router *gin.RouterGroup) {
	var controllers FundSourceControllerInterface = NewFundSourceController()

	router.GET("/", 
	middlewares.ValidatePermissions([]string{"SOF.Read"}),
	controllers.GetSources)
	
	router.POST("/", 
	middlewares.ValidatePermissions([]string{"SOF.Add"}),
	middlewares.ValidateBody[SourceBody], 
	controllers.NewSource)

	router.PUT("/:id/", 
	middlewares.ValidatePermissions([]string{"SOF.Edit"}),
	middlewares.ValidateBody[SourceBody], 
	controllers.UpdateSource)

	router.DELETE("/:id/",
	middlewares.ValidatePermissions([]string{"SOF.Delete"}),
	controllers.DeleteSource)

}
