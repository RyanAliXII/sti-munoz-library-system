package clientlog

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
)

type ClientLogController interface {
	GetClientLogs(ctx * gin.Context)
}
type ClientLog struct {
	clientLogRepo repository.ClientLogRepository
}
func (ctrler * ClientLog) GetClientLogs(ctx * gin.Context){
	filter := repository.ClientLogFilter{}
	filter.Filter.ExtractFilter(ctx)
	logs,metadata, err := ctrler.clientLogRepo.GetLogs(&filter)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetLogsErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"clientLogs": logs,
		"metadata": metadata,
	}, "Client logs fetched."))
}
func NewClientLogController () ClientLogController {
	return &ClientLog{
		clientLogRepo: repository.NewClientLog(),
	}
}