package publisher

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func PublisherRoutes(router *gin.RouterGroup) {
	var controller PublisherControllerInterface = NewPublisherController()
	router.Use(middlewares.ValidatePermissions("Publisher.Access"))
	router.GET("/",
	middlewares.BlockRequestFromClientApp,
	controller.GetPublishers)

	router.POST("/", 
	middlewares.BlockRequestFromClientApp,
	controller.NewPublisher)
	
	router.PUT("/:id/", 
	middlewares.BlockRequestFromClientApp,
	
	controller.UpdatePublisher)

	router.DELETE("/:id/",
	middlewares.BlockRequestFromClientApp,
	controller.DeletePublisher)

}
