package publisher

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/gin-gonic/gin"
)

func PublisherRoutes(router *gin.RouterGroup, services * services.Services) {
	controller := NewPublisherController(services)

	router.GET("/",
	services.PermissionValidator.Validate([]string{"Book.Read","Book.Edit","Publisher.Read"}, 
	true),
	controller.GetPublishers)

	router.POST("/", 
	services.PermissionValidator.Validate([]string{"Book.Add","Book.Edit","Publisher.Add"}, true), 
	controller.NewPublisher)
	
	router.PUT("/:id/",
	services.PermissionValidator.Validate([]string{"Publisher.Edit"}, true), 	
	controller.UpdatePublisher)

	router.DELETE("/:id/",
	services.PermissionValidator.Validate([]string{"Publisher.Delete"}, true), 	
	controller.DeletePublisher)

}
