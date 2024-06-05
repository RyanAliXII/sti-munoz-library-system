package book

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/gin-gonic/gin"
)

func BookRoutes(router *gin.RouterGroup, services * services.Services) {
	controller := NewBookController(services)
	router.GET("/",
	middlewares.ValidatePermissions([]string{"Book.Read"}, false),
	controller.HandleGetBooks)
	router.GET("/:id",
	controller.HandleGetById)
	 
	router.PATCH("/:id/copies",
	middlewares.ValidatePermissions([]string{"Book.Edit"}, true),
	middlewares.ValidateBody[AddBookCopyBody],
	controller.AddBookCopies)

	router.POST("/",
	middlewares.ValidatePermissions([]string{"Book.Add"}, true),
	middlewares.ValidateBody[BookBody], 
	controller.NewBook)

	router.POST("/bulk",
	middlewares.ValidatePermissions([]string{"Book.Add"}, true),
	controller.ImportBooks)
	
	router.POST("/covers", 
	middlewares.ValidatePermissions([]string{"Book.Add"}, true),
	controller.UploadBookCover)
	
	router.PUT("/covers", 
	middlewares.ValidatePermissions([]string{"Book.Edit"}, true),
	controller.UpdateBookCover)

	
	
	router.GET("/accessions", 
	middlewares.ValidatePermissions([]string{"Book.Read"}, true),
	controller.GetAccession)
    router.GET("/accessions/:id", 
	middlewares.ValidatePermissions([]string{"Book.Read"}, true),
	controller.GetAccessionById)

	router.GET("/:id/accessions",
	controller.GetAccessionByBookId)

	router.GET("/accessions/collections/:collectionId", 
	middlewares.ValidatePermissions([]string{"Book.Read", "Book.Edit", "Collection.Edit"}, true),
	controller.GetAccessionsByCollection)

	router.PUT("/accessions/collections/:collectionId", 
	middlewares.ValidatePermissions([]string{"Book.Edit", "Collection.Edit"}, true),
	controller.UpdateAccessionBulk)

	router.PUT("/:id", 
	middlewares.ValidatePermissions([]string{"Book.Edit"}, true),
	middlewares.ValidateBody[BookBody], 
	controller.UpdateBook)
	
	router.PUT("/:id/ebooks", 
	middlewares.ValidatePermissions([]string{"Book.Edit"}, true),
	controller.UpdateEbookById)

	router.PATCH("/accessions/:id/status",
	middlewares.ValidatePermissions([]string{"Book.Edit"}, true),
	controller.UpdateAccessionStatus)

	router.GET("/:id/ebooks", 
	middlewares.BlockRequestFromClientApp, 
	controller.GetEbookById)

	deleteGrp := router.Group("/:id")
	deleteGrp.Use(middlewares.ValidatePermissions([]string{"Book.Edit"}, true))
	deleteGrp.DELETE("/covers",
	controller.DeleteBookCovers)
	deleteGrp.DELETE("/ebooks", 
	controller.RemoveEbookById)
	
	router.PUT("/collections/migrations",
	middlewares.ValidatePermissions([]string{"Book.Edit"}, true),
	middlewares.ValidateBody[MigrateBody],
	controller.MigrateCollection)
	
	router.GET("/exportation", middlewares.ValidatePermissions([]string{"Book.Read"}, true), controller.ExportBooks)
	router.PUT("/accessions/:id", 	middlewares.ValidatePermissions([]string{"Book.Edit"}, true), controller.UpdateAccession)
    
	router.GET("/ebooks/upload-requests", middlewares.ValidatePermissions([]string{"Book.Add", "Book.Edit"}, true), controller.GenerateEbookUploadRequestUrl )
}
