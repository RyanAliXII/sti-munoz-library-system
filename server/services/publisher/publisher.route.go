package publisher

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func PublisherRoutes(router *gin.RouterGroup) {
	var controller PublisherControllerInterface = NewPublisherController()
	router.GET("/", controller.GetPublishers)
	router.POST("/", middlewares.ValidateBody[PublisherBody], controller.NewPublisher)
	router.PUT("/:id/", middlewares.ValidateBody[PublisherBody], controller.UpdatePublisher)
	router.DELETE("/:id/", controller.DeletePublisher)

}
