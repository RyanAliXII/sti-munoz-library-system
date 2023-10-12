package authornum

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)

func AuthorNumberRoutes(router *gin.RouterGroup) {
	var controller AuthorNumberControllerInterface = NewAuthorNumberController()
	router.GET("/", 
	middlewares.BlockRequestFromClientApp,
	controller.GetAuthorNumbers)
}
