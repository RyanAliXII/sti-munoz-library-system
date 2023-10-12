package author

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func AuthorRoutes(router *gin.RouterGroup) {
	var controller AuthorControllerInterface = NewAuthorController()
	router.GET("/", controller.GetAuthors)

	router.POST("/",
	middlewares.ValidateBody[AuthorBody], controller.NewAuthor)
	
	router.PUT("/:id/", 
	middlewares.ValidateBody[AuthorBody], 
	controller.UpdateAuthor)

	router.DELETE("/:id/",
	controller.DeleteAuthor)
}
