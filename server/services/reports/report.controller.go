package reports

import (
	"bytes"
	"fmt"
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/browser"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-rod/rod/lib/proto"
	"github.com/ysmood/gson"
)


type Report struct {
	reportRepo repository.ReportRepository
	inventoryRepo repository.InventoryRepositoryInterface
}

type ReportController interface {
	NewReport(ctx * gin.Context)
	RenderReport(ctx * gin.Context)
	RenderAuditReport(ctx * gin.Context)
}
func NewReportController () ReportController {
	return &Report{
		reportRepo: repository.NewReportRepository(),
		inventoryRepo: repository.NewInventoryRepository(),
	}
}
func(ctrler * Report)NewReport(ctx * gin.Context){
	body := ReportFilter{}
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	
	
	err := body.Validate()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("validateErr"))
		ctx.JSON(httpresp.Success200(nil, "Unknown error occured."))
	}
	browser, err := browser.NewBrowser()
	if err != nil {
		logger.Error(err.Error())
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	page, err := browser.Goto(fmt.Sprintf("http://localhost:5200/renderer/reports?from=%s&to=%s", body.From, body.To))
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
