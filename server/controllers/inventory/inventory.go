package inventory

import (
	"bytes"
	"fmt"
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/browser"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/go-rod/rod/lib/proto"
	"github.com/ysmood/gson"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type Inventory struct {
	services * services.Services
}

func (ctrler *Inventory) GetAudits(ctx *gin.Context) {

	var audits []model.Audit = ctrler.services.Repos.InventoryRepository.GetAudit()

	ctx.JSON(httpresp.Success200(gin.H{"audits": audits}, "Audits fetched."))

}
func (ctrler *Inventory) GetAuditById(ctx *gin.Context) {
	id := ctx.Param("id")
	audit :=ctrler.services.Repos.InventoryRepository.GetById(id)
	if len(audit.Id) == 0 {
		ctx.JSON(httpresp.Fail404(nil, "model.Audit not found."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{"audit": audit}, "model.Audit fetched."))
}
func (ctrler *Inventory) GetAuditedAccession(ctx *gin.Context) {
	id := ctx.Param("id")
	audited, err  :=ctrler.services.Repos.InventoryRepository.GetAuditedAccessionById(id)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("GetAuditedAccessionByIdErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{"audits": audited}, "Accession fetched."))
}
func (ctrler *Inventory)AddBookCopyToAudit(ctx *gin.Context) {
	auditId := ctx.Param("id")
	bookCopy := AuditBookCopyBody{} 
	ctx.ShouldBindBodyWith(&bookCopy, binding.JSON)
	scannErr := ctrler.services.Repos.InventoryRepository.AddToAudit(auditId, bookCopy.AccessionId)
	if  scannErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	
	ctx.JSON(httpresp.Success200(nil, "Book copy audited."))
}

func (ctrler *Inventory)GenerateReport(ctx *gin.Context){
	auditId := ctx.Param("id")
	browser, err := browser.NewBrowser()
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	url := fmt.Sprintf("http://localhost:5200/renderer/reports/audits/%s",auditId)
	page := browser.GetPageFromPool()
	defer browser.ReturnPageToPool(page)
	err = page.Navigate(url)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("NavigateErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	err = page.WaitLoad()
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("waitLoadErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	pdf, err := page.PDF( &proto.PagePrintToPDF{
		PaperWidth:  gson.Num(8.5),
		PaperHeight: gson.Num(11),
		
	})
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("PDFError"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
	}
	var buffer bytes.Buffer
	_, err = buffer.ReadFrom(pdf)
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
	}
	ctx.Data(http.StatusOK, "application/pdf", buffer.Bytes())
}
func (ctrler *Inventory) AddBookToAudit(ctx *gin.Context) {
	auditId := ctx.Param("id")
	bookId := ctx.Param("bookId")

	addErr :=  ctrler.services.Repos.InventoryRepository.AddBookToAudit(auditId, bookId)
	if addErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Book audited."))
}
func (ctrler *Inventory) RemoveBookCopyFromAudit(ctx *gin.Context) {
	auditId := ctx.Param("id")
	accessionId := ctx.Param("accessionId")

	deleteErr :=  ctrler.services.Repos.InventoryRepository.DeleteBookCopyFromAudit(auditId, accessionId)
	if deleteErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Book copy removed."))
}

func (ctrler *Inventory) NewAudit(ctx *gin.Context) {

	var audit model.Audit = model.Audit{}
	ctx.ShouldBindBodyWith(&audit, binding.JSON)
	insertErr :=ctrler.services.Repos.InventoryRepository.NewAudit(audit)

	if insertErr != nil {
		ctx.JSON(httpresp.Fail400(nil, insertErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "model.Audit has been added."))
}
func (ctrler *Inventory) UpdateAudit(ctx *gin.Context) {
	id := ctx.Param("id")
	_, err := uuid.Parse(id)
	if err != nil {
		ctrler.services.Logger.Warn("Invalid UUID value", applog.Function("InventoryController.UpdateAudit"), zap.String("uuid", id))
		ctx.JSON(httpresp.Fail400(nil, "Invalid id param."))
		return
	}
	var audit model.Audit = model.Audit{}

	ctx.ShouldBindBodyWith(&audit, binding.JSON)
	if len(audit.Id) == 0 {
		audit.Id = id
	}
	updatErr := ctrler.services.Repos.InventoryRepository.UpdateAudit(audit)
	if updatErr != nil {
		ctrler.services.Logger.Error(updatErr.Error(), applog.Function("InventoryController.UpdateAudit"), applog.Error("updateErr"))
		ctx.JSON(httpresp.Fail400(nil, updatErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "model.Audit updated"))
}
func NewInventoryController(services * services.Services) InventoryController{
	return &Inventory{
		services: services,
	}
}
type InventoryController interface {
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
