package reports

import (
	"bytes"
	"net/http"
	"net/url"
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/browser"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-rod/rod/lib/proto"
	"github.com/ysmood/gson"
	"go.uber.org/zap"
)


type Report struct {
	services * services.Services
}

type ReportController interface {
	NewReport(ctx * gin.Context)
	RenderReport(ctx * gin.Context)
	RenderAuditReport(ctx * gin.Context)
}
func NewReportController (services * services.Services) ReportController {
	return &Report{
		services: services,
	}
}
func(ctrler * Report)NewReport(ctx * gin.Context){
	body := NewReportBody{}
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	
	u, err := url.Parse("http://localhost:5200/renderer/reports")
	query  := u.Query()
	if err != nil {
		logger.Error(err.Error())
	}
	
	query.Set("clientStatsEnabled", strconv.FormatBool(body.ClientStatistics.Enabled))
	query.Set("clientStatsFrequency", body.ClientStatistics.Frequency)
	query.Set("clientStatsFrom", body.ClientStatistics.From)
	query.Set("clientStatsTo", body.ClientStatistics.To)
	query.Set("borrowedBooksEnabled", strconv.FormatBool(body.BorrowedBooks.Enabled))
	query.Set("borrowedBooksFrom", body.BorrowedBooks.From)
	query.Set("borrowedBooksTo", body.BorrowedBooks.To)
	query.Set("gameStatsEnabled", strconv.FormatBool(body.GameStatistics.Enabled))
	query.Set("gameStatsFrom", body.GameStatistics.From)
	query.Set("gameStatsTo", body.GameStatistics.To)
	query.Set("deviceStatsEnabled", strconv.FormatBool(body.DeviceStatistics.Enabled))
	query.Set("deviceStatsFrom", body.DeviceStatistics.From)
	query.Set("deviceStatsTo", body.DeviceStatistics.To)
	cfg := query.Encode()
	u.RawQuery = cfg
	logger.Info("Generating reports", zap.String("config",cfg))
    browser, err := browser.NewBrowser()
	if err != nil {
		logger.Error(err.Error())
		ctx.Data(http.StatusInternalServerError, "application/pdf", []byte{})
		return
	}
	page := browser.GetPageFromPool()
	defer browser.ReturnPageToPool(page)
	err = page.Navigate(u.String())
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("NavigateErr"))
		ctx.Data(http.StatusInternalServerError, "application/pdf", []byte{})
		return
	}
	err = page.WaitLoad()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("waitLoadErr"))
		ctx.Data(http.StatusInternalServerError, "application/pdf", []byte{})
		return
	}
	pdf, err := page.PDF( &proto.PagePrintToPDF{
		PaperWidth:  gson.Num(8.5),
		PaperHeight: gson.Num(11),
		
	})
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("PDFError"))
		ctx.Data(http.StatusInternalServerError, "application/pdf", []byte{})
	}
	var buffer bytes.Buffer
	_, err = buffer.ReadFrom(pdf)
	if err != nil {
		logger.Error(err.Error())
	}
	ctx.Data(http.StatusOK, "application/pdf", buffer.Bytes())
}
