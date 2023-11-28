package reports

import (
	"encoding/json"
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/gin-gonic/gin"
)



func (ctrler  * Report)RenderReport(ctx * gin.Context){
	reportFilter := ReportFilter{}
	err := ctx.ShouldBindQuery(&reportFilter)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = reportFilter.Validate()
	
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "ValidationErr"))
		return
	}
	reportData, err := ctrler.reportRepo.GenerateReport(reportFilter.From, reportFilter.To)
	if err != nil {
		logger.Error(err.Error())
	}
	gameLogData, err := ctrler.reportRepo.GetGameLogsData(reportFilter.From, reportFilter.To)
	if err != nil {
		logger.Error(err.Error())
	}
	gameLogJSON, err  := json.Marshal(gameLogData)
	if err != nil {
		logger.Error(err.Error())
	}
	walkInLogs, err := ctrler.reportRepo.GetWalkInLogs(reportFilter.From, reportFilter.To)
	if err != nil {
		logger.Error(err.Error())
	}
	walkInLogsJSON, err  := json.Marshal(walkInLogs)
	if err != nil {
		logger.Error(err.Error())
	}
	deviceLogData, err := ctrler.reportRepo.GetDeviceLogsData(reportFilter.From, reportFilter.To)
	if err != nil {
		logger.Error(err.Error())
	}
	deviceLogJSON, err  := json.Marshal(deviceLogData)
	if err != nil {
		logger.Error(err.Error())
	}
	borrowedSections, err := ctrler.reportRepo.GetBorrowedSection(reportFilter.From, reportFilter.To)
	if err != nil {
		logger.Error(err.Error())
	}
	reportFilter.ToReadableDate()
	ctx.HTML(http.StatusOK, "report/index", gin.H{
		"reportData": reportData,
		"gameLogData": gameLogData,
		"deviceLogData" : deviceLogData,
		"gameLogJSON": string(gameLogJSON),
		"deviceLogJSON" : string(deviceLogJSON),
		"walkInLogsJSON": string(walkInLogsJSON),
		"borrowedSections": borrowedSections,
		"from": reportFilter.From,
		"to": reportFilter.To,
	})
}


func (ctrler  * Report)RenderAuditReport(ctx * gin.Context){
	auditId := ctx.Param("auditId")
	audited  := ctrler.inventoryRepo.GetAuditedAccessionById(auditId)
	
	ctx.HTML(http.StatusOK, "report/audit/index", gin.H{
		"auditedBooks": audited,
	})
}