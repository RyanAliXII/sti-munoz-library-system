package publishersrc

import (
	"slim-app/server/app/http/middlewares"
	"slim-app/server/app/repository"

	"github.com/gin-gonic/gin"
)

func PublisherRoutes(router *gin.RouterGroup, repos *repository.Repositories) {
	var controller PublisherControllerInterface = &PublisherController{
		repos: repos,
	}
	router.GET("/", controller.GetPublishers)
	router.POST("/", middlewares.ValidateBody[PublisherBody], controller.NewPublisher)
	router.PUT("/:id/", middlewares.ValidateBody[PublisherBody], controller.UpdatePublisher)
	router.DELETE("/:id/", controller.DeletePublisher)

}