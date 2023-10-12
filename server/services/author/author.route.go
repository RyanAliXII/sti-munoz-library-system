package author

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func AuthorRoutes(router *gin.RouterGroup) {
	var controller AuthorControllerInterface = NewAuthorController()

	router.Use(middlewares.ValidatePermissions("Author.Access"))
	router.GET("/", 
	middlewares.BlockRequestFromClientApp,
	controller.GetAuthors)

	router.POST("/",
	middlewares.BlockRequestFromClientApp,
	middlewares.ValidateBody[AuthorBody], controller.NewAuthor)
	
	router.PUT("/:id/", 
	middlewares.BlockRequestFromClientApp,
	middlewares.ValidateBody[AuthorBody], 
	controller.UpdateAuthor)

	router.DELETE("/:id/",
	middlewares.BlockRequestFromClientApp,
	controller.DeleteAuthor)
}
