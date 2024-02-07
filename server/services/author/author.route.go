package author

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func AuthorRoutes(router *gin.RouterGroup) {
	var controller AuthorControllerInterface = NewAuthorController()
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
