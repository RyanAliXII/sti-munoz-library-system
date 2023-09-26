package author

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func AuthorRoutes(router *gin.RouterGroup) {
	var controller AuthorControllerInterface = NewAuthorController()
	router.GET("/", 
	middlewares.ValidatePermissions([]string{"Author.Read"}),
	controller.GetAuthors)

	router.POST("/",
	middlewares.ValidatePermissions([]string{"Author.Add"}),
	middlewares.ValidateBody[AuthorBody], controller.NewAuthor)

	router.PUT("/:id/", 
	middlewares.ValidatePermissions([]string{"Author.Edit"}),
	middlewares.ValidateBody[AuthorBody], 
	controller.UpdateAuthor)
	router.DELETE("/:id/",
	middlewares.ValidatePermissions([]string{"Author.Delete"}),
	controller.DeleteAuthor)
}
