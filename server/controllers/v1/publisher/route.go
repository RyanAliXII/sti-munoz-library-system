package publisher

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/gin-gonic/gin"
)

func PublisherRoutes(router *gin.RouterGroup, services * services.Services) {
	controller := NewPublisherController(services)

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
