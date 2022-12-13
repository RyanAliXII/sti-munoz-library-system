package routes

import (
	"slim-app/server/app/http/definitions"
	"slim-app/server/app/http/middlewares"
	"slim-app/server/controllers"

	"github.com/gin-gonic/gin"
)

func AuthorRoute(router *gin.RouterGroup, ctlers *controllers.ControllersV1) {

	router.GET("/", ctlers.AuthorController.GetAuthors)
	router.POST("/", middlewares.ValidateBody[definitions.NewAuthorBody], ctlers.AuthorController.NewAuthor)
}
