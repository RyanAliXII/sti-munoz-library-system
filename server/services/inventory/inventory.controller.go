package inventory

import (
	"bytes"
	"fmt"
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/browser"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/go-rod/rod/lib/proto"
	"github.com/ysmood/gson"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type InventoryController struct {
	inventoryRepository repository.InventoryRepositoryInterface
}

func (ctrler *InventoryController) GetAudits(ctx *gin.Context) {

	var audits []model.Audit = ctrler.inventoryRepository.GetAudit()

	ctx.JSON(httpresp.Success200(gin.H{"audits": audits}, "Audits fetched."))

}
func (ctrler *InventoryController) GetAuditById(ctx *gin.Context) {
	id := ctx.Param("id")
	audit := ctrler.inventoryRepository.GetById(id)
	if len(audit.Id) == 0 {
		ctx.JSON(httpresp.Fail404(nil, "model.Audit not found."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{"audit": audit}, "model.Audit fetched."))
}
func (ctrler InventoryController) GetAuditedAccession(ctx *gin.Context) {
	id := ctx.Param("id")
	audited := ctrler.inventoryRepository.GetAuditedAccessionById(id)
	ctx.JSON(httpresp.Success200(gin.H{"audits": audited}, "Accession fetched."))
}
func (ctrler *InventoryController)AddBookCopyToAudit(ctx *gin.Context) {
	auditId := ctx.Param("id")
	bookCopy := AuditBookCopyBody{} 
	ctx.ShouldBindBodyWith(&bookCopy, binding.JSON)
	scannErr := ctrler.inventoryRepository.AddToAudit(auditId, bookCopy.AccessionId)
	if  scannErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	
	ctx.JSON(httpresp.Success200(nil, "Book copy audited."))
}

func (ctrler *InventoryController)GenerateReport(ctx *gin.Context){
	auditId := ctx.Param("id")
	browser, err := browser.NewBrowser()
	if err != nil {
		logger.Error(err.Error())
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	page, err := browser.Goto(fmt.Sprintf("http://localhost:5200/renderer/reports/audits/%s",auditId))
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GotoErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	err = page.WaitLoad()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("waitLoadErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	pdf, err := page.PDF( &proto.PagePrintToPDF{
		PaperWidth:  gson.Num(8.5),
		PaperHeight: gson.Num(11),
		
	})
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("PDFError"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
	}
	var buffer bytes.Buffer
	_, err = buffer.ReadFrom(pdf)
	if err != nil {
		logger.Error(err.Error())
	}
	ctx.Data(http.StatusOK, "application/pdf", buffer.Bytes())
}
func (ctrler *InventoryController) AddBookToAudit(ctx *gin.Context) {
	auditId := ctx.Param("id")
	bookId := ctx.Param("bookId")

	addErr :=  ctrler.inventoryRepository.AddBookToAudit(auditId, bookId)
	if addErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Book audited."))
}
func (ctrler *InventoryController) RemoveBookCopyFromAudit(ctx *gin.Context) {
	auditId := ctx.Param("id")
	accessionId := ctx.Param("accessionId")

	deleteErr :=  ctrler.inventoryRepository.DeleteBookCopyFromAudit(auditId, accessionId)
	if deleteErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Book copy removed."))
}

func (ctrler *InventoryController) NewAudit(ctx *gin.Context) {

	var audit model.Audit = model.Audit{}
	ctx.ShouldBindBodyWith(&audit, binding.JSON)
	insertErr := ctrler.inventoryRepository.NewAudit(audit)

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
	updatErr := ctrler.inventoryRepository.UpdateAudit(audit)
	if updatErr != nil {
		logger.Error(updatErr.Error(), slimlog.Function("InventoryController.UpdateAudit"), slimlog.Error("updateErr"))
		ctx.JSON(httpresp.Fail400(nil, updatErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "model.Audit updated"))
}
func NewInventoryController() InventoryControllerInterface {

	return &InventoryController{
		inventoryRepository: repository.NewInventoryRepository(),
	}

}

type InventoryControllerInterface interface {
	GetAudits(ctx *gin.Context)
	GetAuditById(ctx *gin.Context)
	GetAuditedAccession(ctx *gin.Context)
	AddBookCopyToAudit(ctx * gin.Context)
	AddBookToAudit(ctx *gin.Context)
	NewAudit(ctx *gin.Context)
	UpdateAudit(ctx *gin.Context)
	RemoveBookCopyFromAudit(ctx *gin.Context)
	GenerateReport(ctx *gin.Context) 
}
