package authorsrc

import (
	"slim-app/server/app/http/middlewares"
	"slim-app/server/app/repository"

	"github.com/gin-gonic/gin"
)

func AuthorRoutes(router *gin.RouterGroup, repos *repository.Repositories) {
	var controller AuthorControllerInterface = &AuthorController{Repos: repos}
	router.GET("/", controller.GetAuthors)
	router.POST("/", middlewares.ValidateBody[NewAuthorBody], controller.NewAuthor)
	router.DELETE("/:id/", controller.DeleteAuthor)
}
