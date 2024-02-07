package publisher

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func PublisherRoutes(router *gin.RouterGroup) {
	var controller PublisherControllerInterface = NewPublisherController()

	router.GET("/",
	middlewares.ValidatePermissions([]string{"Book.Read","Bookp.Edit","Publisher.Read"}, 
	true),
	controller.GetPublishers)

	router.POST("/", 
	middlewares.ValidatePermissions([]string{"Book.Add","Book.Edit","Publisher.Add"}, true), 
	controller.NewPublisher)
	
	router.PUT("/:id/",
	middlewares.ValidatePermissions([]string{"Publisher.Edit"}, true), 	
	controller.UpdatePublisher)

	router.DELETE("/:id/",
	middlewares.ValidatePermissions([]string{"Publisher.Delete"}, true), 	
	controller.DeletePublisher)

}
