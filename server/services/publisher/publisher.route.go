package publisher

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func PublisherRoutes(router *gin.RouterGroup) {
	var controller PublisherControllerInterface = NewPublisherController()
	
	router.GET("/",
	middlewares.ValidatePermissions([]string{"Publisher.Read"}),
	controller.GetPublishers)

	router.POST("/", 
	middlewares.ValidatePermissions([]string{"Publisher.Add"}),
	middlewares.ValidateBody[PublisherBody], 
	controller.NewPublisher)
	
	router.PUT("/:id/", 
	middlewares.ValidatePermissions([]string{"Publisher.Edit"}),
	middlewares.ValidateBody[PublisherBody], 
	controller.UpdatePublisher)

	router.DELETE("/:id/",
	middlewares.ValidatePermissions([]string{"Publisher.Delete"}),
	 controller.DeletePublisher)

}
