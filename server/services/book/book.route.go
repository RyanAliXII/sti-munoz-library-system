package book

import (
	"slim-app/server/app/http/middlewares"
	"slim-app/server/repository"

	"github.com/gin-gonic/gin"
)

func BookRoutes(router *gin.RouterGroup, repos *repository.Repositories) {

	var controller BookControllerInterface = &BookController{
		repos: repos,
	}
	router.POST("/", middlewares.ValidateBody[NewBookBody], controller.NewBook)
	router.GET("/", controller.GetBooks)
	router.GET("/accessions", controller.GetAccession)
	router.GET("/:id", controller.GetBookById)
	router.PUT("/:id", middlewares.ValidateBody[UpdateBookBody], controller.UpdateBook)
	router.GET("/:id/accessions", controller.GetAccessionByBookId)
}
