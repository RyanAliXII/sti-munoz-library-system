package author

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/gin-gonic/gin"
)

func AuthorRoutes(router *gin.RouterGroup, services * services.Services) {
	controller := NewAuthorController(services)
	router.GET("/", 
	middlewares.ValidatePermissions([]string{"Book.Read","Book.Edit", "Author.Read"}, true),
	controller.GetAuthors)

	router.POST("/",
	middlewares.ValidatePermissions([]string{"Book.Add", "Book.Edit", "Author.Add"}, true), controller.NewAuthor)
	
	router.PUT("/:id/", 
	middlewares.ValidatePermissions([]string{"Author.Edit"}, true),
	controller.UpdateAuthor)

	router.DELETE("/:id/",
	middlewares.ValidatePermissions([]string{"Author.Delete"}, true),
	controller.DeleteAuthor)
}
