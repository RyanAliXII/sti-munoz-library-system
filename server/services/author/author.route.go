package author

import (
	"slim-app/server/app/http/middlewares"
	"slim-app/server/repository"

	"github.com/gin-gonic/gin"
)

func AuthorRoutes(router *gin.RouterGroup, repos *repository.Repositories) {
	var controller AuthorControllerInterface = &AuthorController{repos: repos}
	router.GET("/", controller.GetAuthors)
	router.POST("/", middlewares.ValidateBody[AuthorBody], controller.NewAuthor)
	router.PUT("/:id/", middlewares.ValidateBody[AuthorBody], controller.UpdateAuthor)
	router.DELETE("/:id/", controller.DeleteAuthor)
}
