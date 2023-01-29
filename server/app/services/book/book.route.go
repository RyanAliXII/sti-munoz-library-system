package book

import (
	"slim-app/server/app/http/middlewares"
	"slim-app/server/app/repository"

	"github.com/gin-gonic/gin"
)

func BookRoutes(router *gin.RouterGroup, repos *repository.Repositories) {

	var controller BookControllerInterface = &BookController{
		repos: repos,
	}
	router.POST("/", middlewares.ValidateBody[NewBookBody], controller.NewBook)
	router.GET("/", controller.GetBook)
	router.GET("/accessions", controller.GetAccession)
	router.GET("/:id", controller.GetBookById)
	router.PUT("/:id", middlewares.ValidateBody[UpdateBookBody], controller.UpdateBook)
}
