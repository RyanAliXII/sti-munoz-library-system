package reports

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)


type ReportConfigBody struct {
	ClientStatsEnabled     bool   `form:"clientStatsEnabled"`
	ClientStatsFrequency   string `form:"clientStatsFrequency"`
	ClientStatsFrom        string `form:"clientStatsFrom"`
	ClientStatsTo          string `form:"clientStatsTo"`
	BorrowedBooksEnabled   bool   `form:"borrowedBooksEnabled"`
	BorrowedBooksFrom      string `form:"borrowedBooksFrom"`
	BorrowedBooksTo        string `form:"borrowedBooksTo"`
	GameStatsEnabled       bool   `form:"gameStatsEnabled"`
	GameStatsFrom          string `form:"gameStatsFrom"`
	GameStatsTo            string `form:"gameStatsTo"`
	DeviceStatsEnabled     bool   `form:"deviceStatsEnabled"`
	DeviceStatsFrom        string `form:"deviceStatsFrom"`
	DeviceStatsTo          string `form:"deviceStatsTo"`
}
func (ctrler  * Report)RenderReport(ctx * gin.Context){
	reportBody := ReportConfigBody{}
	ctx.ShouldBindQuery(&reportBody)
	fmt.Println(reportBody)


	walkIns,labels, err := ctrler.reportRepo.GetWalkIns(reportBody.ClientStatsFrom, reportBody.ClientStatsTo, reportBody.ClientStatsFrequency)
	if err != nil {
		logger.Error(err.Error())
	}
	walkInLabels, err  := json.Marshal(labels)
	if err != nil {
		logger.Error(err.Error())
	}
	walkInsJSON, err  := json.Marshal(walkIns)
	if err != nil {
		logger.Error(err.Error())
	}
	fmt.Println(walkIns)

	reportFilter := ReportFilter{
		From: reportBody.ClientStatsFrom,
		To: reportBody.ClientStatsTo,
	}
	reportData, err := ctrler.reportRepo.GenerateReport(reportFilter.From, reportFilter.To)
	if err != nil {
		logger.Error(err.Error())
	}
	gameLogData, err := ctrler.reportRepo.GetGameLogsData(reportBody.GameStatsFrom, reportBody.GameStatsTo)
	if err != nil {
		logger.Error(err.Error())
	}
	gameLogJSON, err  := json.Marshal(gameLogData)
	if err != nil {
		logger.Error(err.Error())
	}

	deviceLogData, err := ctrler.reportRepo.GetDeviceLogsData(reportBody.DeviceStatsFrom, reportBody.DeviceStatsTo)
	if err != nil {
		logger.Error(err.Error())
	}
	deviceLogJSON, err  := json.Marshal(deviceLogData)
	if err != nil {
		logger.Error(err.Error())
	}
	borrowedBooks, err := ctrler.reportRepo.GetBorrowingReportData(reportBody.BorrowedBooksFrom, reportFilter.To)
	borrowedSections, err := ctrler.reportRepo.GetBorrowedSection(reportBody.BorrowedBooksFrom, reportFilter.To)
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
		"walkInLogsJSON": string(walkInsJSON),
		"borrowedSections": borrowedSections,
		"borrowing": borrowedBooks, 
		"from": reportFilter.From,
		"to": reportFilter.To,
		"walkInLabels": string(walkInLabels),
		"config": reportBody,
	})
}


func (ctrler  * Report)RenderAuditReport(ctx * gin.Context){
	auditId := ctx.Param("auditId")
	audited  := ctrler.inventoryRepo.GetAuditedAccessionById(auditId)
	
	ctx.HTML(http.StatusOK, "report/audit/index", gin.H{
		"auditedBooks": audited,
	})

}