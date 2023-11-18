package borrowing

import (
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type BorrowingQueue struct {
	queueRepo repository.BorrowingQueueRepository
}
type BorrowingQueueController interface {
	Queue( * gin.Context)
	GetActiveQueues(* gin.Context) 
}

func NewBorrowingQueue()BorrowingQueueController{
	return &BorrowingQueue{
     queueRepo: repository.NewBorrowingQueue(),
	}
}

func (ctrler * BorrowingQueue) Queue(ctx * gin.Context) {
	queueBody := model.BorrowingQueue{}
	app := ctx.GetString("requestorApp")
	err := ctx.ShouldBindBodyWith(&queueBody, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured"))
		return
	}
	if app == azuread.ClientAppClientId{
		ctrler.handleClientQueue(ctx, &queueBody)
		return
	}
	ctx.AbortWithStatus(http.StatusUnauthorized)
}
func(ctrler * BorrowingQueue) handleClientQueue (ctx * gin.Context, body * model.BorrowingQueue)  {
	accountId := ctx.GetString("requestorId")
	body.AccountId = accountId
	err := ctrler.queueRepo.Queue(*body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("QueueErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Added to queue successfully."))
}



func (ctrler * BorrowingQueue)GetActiveQueues(ctx * gin.Context) {
	app := ctx.GetString("requestorApp")
	if app == azuread.ClientAppClientId{
		ctrler.handleGetClientActiveQueues(ctx)
		return
	}
	ctx.AbortWithStatus(http.StatusUnauthorized)
}

func (ctrler * BorrowingQueue )handleGetClientActiveQueues(ctx * gin.Context)  {
	accountId := ctx.GetString("requestorId")
	queues, err := ctrler.queueRepo.GetClientActiveQueues(accountId)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetClientActiveQueues"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return 
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"queues" : queues,
	}, "Active queues fetch"))
}	