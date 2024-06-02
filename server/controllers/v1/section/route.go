package section

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

func SectionRoutes(router *gin.RouterGroup, services * services.Services) {
	controller := NewSectionController(services)
	router.GET("/", 
	controller.GetCategories)
	router.POST("/",
	middlewares.ValidatePermissions([]string{"Collection.Add"}, true), 
	controller.NewCategory)
	router.PUT("/:id",
	middlewares.ValidatePermissions([]string{"Collection.Edit"}, true), 
	controller.UpdateSection)
	router.DELETE("/:id", 
	middlewares.ValidatePermissions([]string{"Collection.Delete"}, true), 
	controller.DeleteCollection)
}
