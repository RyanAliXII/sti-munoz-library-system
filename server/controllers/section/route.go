package section

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

func SectionRoutes(router *gin.RouterGroup, services * services.Services) {
	controller := NewSectionController(services)
	router.GET("/", 
	controller.GetCategories)
	router.POST("/",
	services.PermissionValidator.Validate([]string{"Collection.Add"}, true), 
	controller.NewCategory)
	router.PUT("/:id",
	services.PermissionValidator.Validate([]string{"Collection.Edit"}, true), 
	controller.UpdateSection)
	router.DELETE("/:id", 
	services.PermissionValidator.Validate([]string{"Collection.Delete"}, true), 
	controller.DeleteCollection)
}
