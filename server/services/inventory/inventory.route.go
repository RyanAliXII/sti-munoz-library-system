package inventory

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func InventoryRoutes(router *gin.RouterGroup) {
	var controller InventoryControllerInterface = NewInventoryController()
	router.GET("/audits", controller.GetAudits)
	router.POST("/audits", middlewares.ValidateBody[InventoryBody], controller.NewAudit)
	router.PUT("/audits/:id", middlewares.ValidateBody[InventoryBody], controller.UpdateAudit)
	router.GET("/audits/:id", controller.GetAuditById)
	router.GET("/audits/:id/books", controller.GetAuditedAccession)

	auditActionGrp := router.Group("/audits/:id")
	auditActionGrp.POST("/", controller.AddBookCopyToAudit)
	auditActionGrp.DELETE("/accessions/:accessionId", controller.RemoveBookCopyFromAudit)
	auditActionGrp.POST("/books/:bookId", controller.AddBookToAudit)
}
