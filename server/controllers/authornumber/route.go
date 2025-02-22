package authornumber

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

func AuthorNumberRoutes(router *gin.RouterGroup, services * services.Services) {
	controller := NewAuthorNumberController(services)
	router.GET("/", 
	middlewares.BlockRequestFromClientApp(services.Config.AdminAppClientID),
	controller.GetAuthorNumbers)
}
