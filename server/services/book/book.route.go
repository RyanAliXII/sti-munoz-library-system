package book

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func BookRoutes(router *gin.RouterGroup) {

	var controller BookControllerInterface = NewBookController()
	

	router.GET("/", 
	middlewares.ValidatePermissions([]string{"Book.Read"}),
	controller.GetBooks)
	
	router.GET("/:id",
	middlewares.ValidatePermissions([]string{"Book.Read"}),
	controller.GetBookById)
	 
	router.PATCH("/:id/copies",middlewares.ValidateBody[AddBookCopyBody],controller.AddBookCopies)
	router.POST("/",
	middlewares.ValidatePermissions([]string{"Book.Add"}),
	middlewares.ValidateBody[BookBody], 
	controller.NewBook)
	
	router.POST("/covers", 
	middlewares.ValidatePermissions([]string{"Book.Cover.Add"}),
	controller.UploadBookCover)
	
	router.PUT("/covers", 
	middlewares.ValidatePermissions([]string{"Book.Cover.Edit"}),
	controller.UpdateBookCover)

	router.DELETE("/:bookId/covers", controller.DeleteBookCovers)
	
	router.GET("/accessions", 
	middlewares.ValidatePermissions([]string{"Accession.Read"}),
	controller.GetAccession)
   
	router.GET("/:id/accessions",
	middlewares.ValidatePermissions([]string{"Accession.Read", "Book.Read"}),
	controller.GetAccessionByBookId)

	router.PUT("/:id", 
	middlewares.ValidatePermissions([]string{"Book.Edit"}),
	middlewares.ValidateBody[BookBody], 
	controller.UpdateBook)
	

	router.PATCH("/accessions/:id/status", controller.UpdateAccessionStatus)

}
