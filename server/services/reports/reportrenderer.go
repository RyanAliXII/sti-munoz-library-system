package reports

import (
	"encoding/json"
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
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
	
	walkIns, err := ctrler.reportRepo.GetWalkIns(reportBody.ClientStatsFrom, reportBody.ClientStatsTo, reportBody.ClientStatsFrequency)
	if err != nil {
		logger.Error(err.Error())
	}
	walkInsJSON, err  := json.Marshal(walkIns)
	if err != nil {
		logger.Error(err.Error())
	}
	clientStats, err := ctrler.reportRepo.GetClientStats(reportBody.ClientStatsFrom, reportBody.ClientStatsTo)
	if err != nil {
		logger.Error(err.Error())
	}
	walkInsTable := generateClientWalkInsTable(walkIns)
	
	
	borrowingReportData, err := ctrler.reportRepo.GetBorrowingReportData(reportBody.BorrowedBooksFrom, reportBody.BorrowedBooksTo)
	if err != nil {
		logger.Error(err.Error())
	}
	borrowingData, err := ctrler.reportRepo.GetBorrowingReportData(reportBody.BorrowedBooksFrom, reportBody.BorrowedBooksTo)
	if err != nil {
		logger.Error(err.Error())
	}
	borrowedBooks, err := ctrler.reportRepo.GetBorrowedBooks(reportBody.BorrowedBooksFrom, reportBody.BorrowedBooksTo)
	if err != nil {
		logger.Error(err.Error())
	}
	
	borrowedSections, err := ctrler.reportRepo.GetBorrowedSection(reportBody.BorrowedBooksFrom, reportBody.BorrowedBooksTo)
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

	gameLogs, err := ctrler.reportRepo.GetGameLogs(reportBody.GameStatsFrom, reportBody.GameStatsTo)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("gameLogsErr"))
	}
	deviceLogsGrouped, err := ctrler.reportRepo.GetDeviceLogsData(reportBody.DeviceStatsFrom, reportBody.DeviceStatsTo)
	if err != nil {
		logger.Error(err.Error())
	}
	deviceLogsGroupedJSON, err  := json.Marshal(deviceLogsGrouped)
	if err != nil {
		logger.Error(err.Error())
	}
	deviceLogs, err := ctrler.reportRepo.GetDeviceLogs(reportBody.DeviceStatsFrom, reportBody.DeviceStatsTo)
	if err != nil {
		logger.Error(err.Error())
	}
	ctx.HTML(http.StatusOK, "report/index", gin.H{
		"reportData": borrowingReportData,
		"gameLogData": gameLogData,
		"deviceLogsGrouped" : deviceLogsGrouped,
		"gameLogJSON": string(gameLogJSON),
		"deviceLogsGroupedJSON" : string(deviceLogsGroupedJSON),
		"deviceLogs": deviceLogs,
		"walkInLogsJSON": string(walkInsJSON),
		"walkIns": walkIns,
		"clientStats": clientStats,
		"borrowedSections": borrowedSections,
		"borrowing": borrowingData, 
		"borrowedBooks": borrowedBooks,
		"config": reportBody,
		"walkInsTable": walkInsTable,
		"gameLogs": gameLogs,
	})
}

func generateClientWalkInsTable (walkIns []model.WalkInData)(map[string][]int){
	m := make(map[string][]int, 0)
	if (len(walkIns) > 0){
		root := walkIns[0]
		for outer, l := range root.Logs{
			list := make([]int, 0)
			for _, w := range walkIns {
				list = append(list,w.Logs[outer].Count)
			}
			m[l.Date] = list
		}
		return m		
	}
	return m
}


func (ctrler  * Report)RenderAuditReport(ctx * gin.Context){
	auditId := ctx.Param("auditId")
	audited  := ctrler.inventoryRepo.GetAuditedAccessionById(auditId)
	
	ctx.HTML(http.StatusOK, "report/audit/index", gin.H{
		"auditedBooks": audited,
	})

}