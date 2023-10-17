package book

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func BookRoutes(router *gin.RouterGroup) {

var controller BookControllerInterface = NewBookController()
	router.Use(middlewares.ValidatePermissions("Book.Access"))

	router.GET("/",
	controller.HandleGetBooks)
	router.GET("/:id",
	controller.HandleGetById)
	 
	router.PATCH("/:id/copies",
	middlewares.BlockRequestFromClientApp,
	middlewares.ValidateBody[AddBookCopyBody],
	controller.AddBookCopies)

	router.POST("/",
	middlewares.BlockRequestFromClientApp,
	middlewares.ValidateBody[BookBody], 
	controller.NewBook)

	router.POST("/bulk",
	middlewares.BlockRequestFromClientApp,
	controller.ImportBooks)
	
	router.POST("/covers", 
	middlewares.BlockRequestFromClientApp,
	controller.UploadBookCover)
	
	router.PUT("/covers", 
	middlewares.BlockRequestFromClientApp,
	controller.UpdateBookCover)

	
	
	router.GET("/accessions", 
	middlewares.BlockRequestFromClientApp,
	controller.GetAccession)
   
	router.GET("/:id/accessions",
	controller.GetAccessionByBookId)

	router.PUT("/:id", 
	middlewares.BlockRequestFromClientApp,
	middlewares.ValidateBody[BookBody], 
	controller.UpdateBook)
	

	router.PATCH("/accessions/:id/status",
	middlewares.BlockRequestFromClientApp,
	controller.UpdateAccessionStatus)

	router.POST("/:id/ebooks", 
	middlewares.BlockRequestFromClientApp, 
	controller.UploadEBook)

	router.GET("/:id/ebooks", 
	middlewares.BlockRequestFromClientApp, 
	controller.GetEbookById)

	deleteGrp := router.Group("/:id")
	deleteGrp.DELETE("/covers",
	middlewares.BlockRequestFromClientApp, 
	controller.DeleteBookCovers)
	deleteGrp.DELETE("/ebooks", 
	middlewares.BlockRequestFromClientApp, 
	controller.RemoveEbookById)

}
