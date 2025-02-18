package author

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/gin-gonic/gin"
)

func AuthorRoutes(router *gin.RouterGroup, services * services.Services) {
	controller := NewAuthorController(services)
	router.GET("/", 
	services.PermissionValidator.Validate([]string{"Book.Read","Book.Edit", "Author.Read"}, true),
	controller.GetAuthors)

	router.POST("/",
	services.PermissionValidator.Validate([]string{"Book.Add", "Book.Edit", "Author.Add"}, true), controller.NewAuthor)
	
	router.PUT("/:id/", 
	services.PermissionValidator.Validate([]string{"Author.Edit"}, true),
	controller.UpdateAuthor)

	router.DELETE("/:id/",
	services.PermissionValidator.Validate([]string{"Author.Delete"}, true),
	controller.DeleteAuthor)
}
