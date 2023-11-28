package inventory

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func InventoryRoutes(router *gin.RouterGroup) {
	var controller InventoryControllerInterface = NewInventoryController()
	router.Use(middlewares.ValidatePermissions("Audit.Access"))

	router.GET("/audits", 
	middlewares.BlockRequestFromClientApp,
	controller.GetAudits)

	router.POST("/audits", 
	middlewares.BlockRequestFromClientApp,
	middlewares.ValidateBody[InventoryBody], controller.NewAudit)

	router.PUT("/audits/:id", 
	middlewares.BlockRequestFromClientApp,
	middlewares.ValidateBody[InventoryBody], 
	controller.UpdateAudit)

	router.GET("/audits/:id", 
	middlewares.BlockRequestFromClientApp,
	controller.GetAuditById)
	router.GET("/audits/:id/books", controller.GetAuditedAccession)

	auditActionGrp := router.Group("/audits/:id")
	auditActionGrp.POST("/", 
	middlewares.BlockRequestFromClientApp,
	controller.AddBookCopyToAudit)
	
	auditActionGrp.DELETE("/accessions/:accessionId", 
	middlewares.BlockRequestFromClientApp,
	controller.RemoveBookCopyFromAudit)

	auditActionGrp.POST("/books/:bookId", 
	middlewares.BlockRequestFromClientApp,
	controller.AddBookToAudit)
	auditActionGrp.POST("/reports", middlewares.BlockRequestFromClientApp, controller.GenerateReport)
}
