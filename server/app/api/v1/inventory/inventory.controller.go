package inventory

import (
	"slim-app/server/app/http/httpresp"
	"slim-app/server/app/model"
	"slim-app/server/app/repository"
	"strconv"

	"github.com/gin-gonic/gin"
)

type InventoryController struct {
	repos *repository.Repositories
}

func (ctrler *InventoryController) GetAudits(ctx *gin.Context) {

	var audits []model.Audit = ctrler.repos.InventoryRepository.GetAudit()

	ctx.JSON(httpresp.Success200(gin.H{"audits": audits}, "Audits fetched."))

}
func (ctrler *InventoryController) GetAuditById(ctx *gin.Context) {
	id := ctx.Param("id")
	audit := ctrler.repos.InventoryRepository.GetById(id)
	if len(audit.Id) == 0 {
		ctx.JSON(httpresp.Fail404(nil, "Audit not found."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{"audit": audit}, "Audit fetched."))
}
func (ctrler *InventoryController) GetAuditedAccession(ctx *gin.Context) {
	id := ctx.Param("id")
	audited := ctrler.repos.InventoryRepository.GetAuditedAccessionById(id)
	ctx.JSON(httpresp.Success200(gin.H{"audits": audited}, "Accession fetched."))
}
func (ctrler *InventoryController) AddBookToAudit(ctx *gin.Context) {
	auditId := ctx.Param("id")
	bookId := ctx.Param("bookId")
	accessionId := ctx.Param("accessionId")
	parsedAccessionId, parseErr := strconv.Atoi(accessionId)
	if parseErr != nil {
		ctx.JSON(httpresp.Fail400(nil, "Invalid accession number."))
		return
	}
	ctrler.repos.InventoryRepository.AddToAudit(auditId, bookId, parsedAccessionId)
	ctx.JSON(httpresp.Success200(nil, "Book audited."))
}

type InventoryControllerInterface interface {
	GetAudits(ctx *gin.Context)
	GetAuditById(ctx *gin.Context)
	GetAuditedAccession(ctx *gin.Context)
	AddBookToAudit(ctx *gin.Context)
}
