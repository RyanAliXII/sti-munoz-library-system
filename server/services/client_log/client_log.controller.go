package clientlog

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
)

type ClientLogController interface {

}
type ClientLog struct {
	clientLogRepo repository.ClientLogRepository
}
func (ctrler * ClientLog) GetClientLogs(ctx * gin.Context){}
func NewClientLogController () ClientLogController {
	return &ClientLog{
		clientLogRepo: repository.NewClientLog(),
	}
}