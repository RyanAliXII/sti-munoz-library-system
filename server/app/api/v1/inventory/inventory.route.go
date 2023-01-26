package inventory

import (
	"slim-app/server/app/repository"

	"github.com/gin-gonic/gin"
)

func InventoryRoutes(router *gin.RouterGroup, repos *repository.Repositories) {
	var controller InventoryControllerInterface = &InventoryController{
		repos: repos,
	}

	router.GET("/audits", controller.GetAudits)
	router.GET("/audits/:id", controller.GetAuditById)
	router.GET("/audits/:id/books", controller.GetAuditedAccession)
}
