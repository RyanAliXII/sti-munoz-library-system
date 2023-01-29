package inventory

import (
	"slim-app/server/app/http/httpresp"
	"slim-app/server/app/model"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/app/repository"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/google/uuid"
	"go.uber.org/zap"
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
		ctx.JSON(httpresp.Fail404(nil, "model.Audit not found."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{"audit": audit}, "model.Audit fetched."))
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

func (ctrler *InventoryController) NewAudit(ctx *gin.Context) {

	var audit model.Audit = model.Audit{}
	ctx.ShouldBindBodyWith(&audit, binding.JSON)
	insertErr := ctrler.repos.InventoryRepository.NewAudit(audit)

	if insertErr != nil {
		ctx.JSON(httpresp.Fail400(nil, insertErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "model.Audit has been added."))
}
func (ctrler *InventoryController) UpdateAudit(ctx *gin.Context) {
	id := ctx.Param("id")
	_, err := uuid.Parse(id)
	if err != nil {
		logger.Warn("Invalid UUID value", slimlog.Function("InventoryController.UpdateAudit"), zap.String("uuid", id))
		ctx.JSON(httpresp.Fail400(nil, "Invalid id param."))
		return
	}
	var audit model.Audit = model.Audit{}

	ctx.ShouldBindBodyWith(&audit, binding.JSON)
	if len(audit.Id) == 0 {
		audit.Id = id
	}
	updatErr := ctrler.repos.InventoryRepository.UpdateAudit(audit)
	if updatErr != nil {
		logger.Error(updatErr.Error(), slimlog.Function("InventoryController.UpdateAudit"), slimlog.Error("updateErr"))
		ctx.JSON(httpresp.Fail400(nil, updatErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "model.Audit updated"))
}

type InventoryControllerInterface interface {
	GetAudits(ctx *gin.Context)
	GetAuditById(ctx *gin.Context)
	GetAuditedAccession(ctx *gin.Context)
	AddBookToAudit(ctx *gin.Context)
	NewAudit(ctx *gin.Context)
	UpdateAudit(ctx *gin.Context)
}
