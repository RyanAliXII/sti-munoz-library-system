package book

import (
	"slim-app/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func BookRoutes(router *gin.RouterGroup) {

	var controller BookControllerInterface = NewBookController()
	router.POST("/", middlewares.ValidateBody[BookBody], controller.NewBook)
	router.GET("/", controller.GetBooks)
	router.GET("/accessions", controller.GetAccession)
	router.GET("/:id", controller.GetBookById)
	router.PUT("/:id", middlewares.ValidateBody[BookBody], controller.UpdateBook)
	router.GET("/:id/accessions", controller.GetAccessionByBookId)
}
