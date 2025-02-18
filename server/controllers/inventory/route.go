package inventory

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/gin-gonic/gin"
)

func InventoryRoutes(router *gin.RouterGroup, services* services.Services) {
	controller  := NewInventoryController(services)
	router.Use(services.PermissionValidator.Validate([]string{"Audit.Access"}, true))
	router.GET("/audits", controller.GetAudits)

	router.POST("/audits", middlewares.ValidateBody[InventoryBody], controller.NewAudit)

	router.PUT("/audits/:id", middlewares.ValidateBody[InventoryBody], 
	controller.UpdateAudit)

	router.GET("/audits/:id",controller.GetAuditById)
	router.GET("/audits/:id/books", controller.GetAuditedAccession)

	auditActionGrp := router.Group("/audits/:id")
	auditActionGrp.POST("/", controller.AddBookCopyToAudit)
	
	auditActionGrp.DELETE("/accessions/:accessionId", controller.RemoveBookCopyFromAudit)

	auditActionGrp.POST("/books/:bookId",controller.AddBookToAudit)
	auditActionGrp.POST("/reports", controller.GenerateReport)
}
