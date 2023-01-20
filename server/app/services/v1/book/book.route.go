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
	router.POST("/", middlewares.ValidateBody[BookBody], controller.NewBook)
	router.GET("/", controller.GetBook)
	router.GET("/accession", controller.GetAccession)
}
