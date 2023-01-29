package inventory

import (
	"slim-app/server/app/http/middlewares"
	"slim-app/server/repository"

	"github.com/gin-gonic/gin"
)

func InventoryRoutes(router *gin.RouterGroup, repos *repository.Repositories) {
	var controller InventoryControllerInterface = &InventoryController{
		repos: repos,
	}

	router.GET("/audits", controller.GetAudits)
	router.POST("/audits", middlewares.ValidateBody[InventoryBody], controller.NewAudit)
	router.PUT("/audits/:id", middlewares.ValidateBody[InventoryBody], controller.UpdateAudit)
	router.GET("/audits/:id", controller.GetAuditById)
	router.GET("/audits/:id/books", controller.GetAuditedAccession)
	router.POST("/audits/:id/books/:bookId/accessions/:accessionId", controller.AddBookToAudit)
}
