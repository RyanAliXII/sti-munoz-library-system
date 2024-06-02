package clientlog

import (
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

type ClientLogController interface {
	GetClientLogs(ctx * gin.Context)
	ExportClientLogs(ctx * gin.Context)
}
type ClientLog struct {
	services * services.Services
}
func (ctrler * ClientLog) GetClientLogs(ctx * gin.Context){
	filter := NewFilter(ctx)
	filter.Filter.ExtractFilter(ctx)
	logs,metadata, err := ctrler.services.Repos.ClientLogRepository.GetLogs(&repository.ClientLogFilter{
		From: filter.From,
		To: filter.To,
		UserTypes: filter.UserTypes,
		UserPrograms: filter.UserPrograms,
		SortBy: filter.SortBy,
		Order: filter.Order,
		Filter: filter.Filter,
	})
	
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetLogsErr"))
	}

	if err != nil {
		logger.Error(err.Error(),)
	}
	
	ctx.JSON(httpresp.Success200(gin.H{
		"clientLogs": logs,
		"metadata": metadata,
	}, "Client logs fetched."))
}
func (ctrler * ClientLog)ExportClientLogs(ctx * gin.Context){
	fileType := ctx.Query("fileType")

	
	filter := NewFilter(ctx)
	filter.Filter.ExtractFilter(ctx)

	if(fileType == ".csv"){
		logs, err := ctrler.services.Repos.ClientLogRepository.GetCSVData(&repository.ClientLogFilter{
			From: filter.From,
			To: filter.To,
			UserTypes: filter.UserTypes,
			UserPrograms: filter.UserPrograms,
			SortBy: filter.SortBy,
			Order: filter.Order,
			Filter: filter.Filter,
		})
		if err != nil {
			logger.Error(err.Error())
			ctx.Data(http.StatusInternalServerError, "", []byte{})
			return
		}
		buffer, err := ctrler.services.ClientLogExport.ExportCSV(logs)
		if err != nil {
			logger.Error(err.Error())
			ctx.Data(http.StatusInternalServerError, "", []byte{})
			return
		}
		ctx.Data(http.StatusOK, "text/csv", buffer.Bytes())
		return
	}
	if(fileType == ".xlsx"){
		logs, err := ctrler.services.Repos.ClientLogRepository.GetExcelData(&repository.ClientLogFilter{
			From: filter.From,
			To: filter.To,
			UserTypes: filter.UserTypes,
			UserPrograms: filter.UserPrograms,
			SortBy: filter.SortBy,
			Order: filter.Order,
			Filter: filter.Filter,
		})
		if err != nil {
			logger.Error(err.Error())
			ctx.Data(http.StatusInternalServerError, "", []byte{})
			return
		}
		buffer, err := ctrler.services.ClientLogExport.ExportExcel(logs)
		if err != nil {
			logger.Error(err.Error())
			ctx.Data(http.StatusInternalServerError, "", []byte{})
			return
		}
		ctx.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer.Bytes())
	}
	ctx.Data(http.StatusOK, "", []byte{})
}
func NewClientLogController (services * services.Services) ClientLogController {
	return &ClientLog{
		services: services,
	}
}