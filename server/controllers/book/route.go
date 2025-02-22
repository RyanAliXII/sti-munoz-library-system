package book

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/gin-gonic/gin"
)

func BookRoutes(router *gin.RouterGroup, services * services.Services) {
	controller := NewBookController(services)
	router.GET("/",
	services.PermissionValidator.Validate([]string{"Book.Read"}, false),
	controller.HandleGetBooks)
	router.GET("/:id",
	controller.HandleGetById)
	 
	router.PATCH("/:id/copies",
	services.PermissionValidator.Validate([]string{"Book.Edit"}, true),
	middlewares.ValidateBody[AddBookCopyBody],
	controller.AddBookCopies)
	
	router.DELETE("/:id", services.PermissionValidator.Validate([]string{"Book.Delete"}, true), controller.DeleteBook)

	router.POST("/",
	services.PermissionValidator.Validate([]string{"Book.Add"}, true),
	middlewares.ValidateBody[BookBody], 
	controller.NewBook)

	router.POST("/bulk",
	services.PermissionValidator.Validate([]string{"Book.Add"}, true),
	controller.ImportBooks)
	
	router.POST("/covers", 
	services.PermissionValidator.Validate([]string{"Book.Add"}, true),
	controller.UploadBookCover)
	
	router.PUT("/covers", 
	services.PermissionValidator.Validate([]string{"Book.Edit"}, true),
	controller.UpdateBookCover)

	
	
	router.GET("/accessions", 
	services.PermissionValidator.Validate([]string{"Book.Read"}, true),
	controller.GetAccession)
	router.DELETE("/accessions/:id", 
	services.PermissionValidator.Validate([]string{"Book.Delete"}, true),
	controller.DeleteAccession)
    router.GET("/accessions/:id", 
	services.PermissionValidator.Validate([]string{"Book.Read"}, true),
	controller.GetAccessionById)

	router.GET("/:id/accessions",
	controller.GetAccessionByBookId)

	router.GET("/accessions/collections/:collectionId", 
	services.PermissionValidator.Validate([]string{"Book.Read", "Book.Edit", "Collection.Edit"}, true),
	controller.GetAccessionsByCollection)

	router.PUT("/accessions/collections/:collectionId", 
	services.PermissionValidator.Validate([]string{"Book.Edit", "Collection.Edit"}, true),
	controller.UpdateAccessionBulk)

	router.PUT("/:id", 
	services.PermissionValidator.Validate([]string{"Book.Edit"}, true),
	middlewares.ValidateBody[BookBody], 
	controller.UpdateBook)
	
	router.PUT("/:id/ebooks", 
	services.PermissionValidator.Validate([]string{"Book.Edit"}, true),
	controller.UpdateEbookById)

	router.PATCH("/accessions/:id/status",
	services.PermissionValidator.Validate([]string{"Book.Edit"}, true),
	controller.UpdateAccessionStatus)

	router.GET("/:id/ebooks", 
	middlewares.BlockRequestFromClientApp(services.Config.AdminAppClientID), 
	controller.GetEbookById)

	deleteGrp := router.Group("/:id")
	deleteGrp.Use(services.PermissionValidator.Validate([]string{"Book.Edit"}, true))
	deleteGrp.DELETE("/covers",
	controller.DeleteBookCovers)
	deleteGrp.DELETE("/ebooks", 
	controller.RemoveEbookById)
	
	router.PUT("/collections/migrations",
	services.PermissionValidator.Validate([]string{"Book.Edit"}, true),
	middlewares.ValidateBody[MigrateBody],
	controller.MigrateCollection)
	
	router.GET("/exportation", services.PermissionValidator.Validate([]string{"Book.Read"}, true), controller.ExportBooks)
	router.PUT("/accessions/:id", 	services.PermissionValidator.Validate([]string{"Book.Edit"}, true), controller.UpdateAccession)
    
	router.GET("/ebooks/upload-requests", services.PermissionValidator.Validate([]string{"Book.Add", "Book.Edit"}, true), controller.GenerateEbookUploadRequestUrl )
}
