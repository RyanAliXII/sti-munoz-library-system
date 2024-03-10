package borrowing

import (
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type BorrowingQueue struct {
	services * services.Services
}
type BorrowingQueueController interface {
	Queue( * gin.Context)
	GetActiveQueues(* gin.Context) 
	DequeueByBookId(ctx * gin.Context)
	GetQueueItemsByBookId(ctx * gin.Context)
	UpdateQueueItems(ctx * gin.Context)
	DequeueItem(ctx * gin.Context) 
	GetInactiveQueueItems(ctx * gin.Context)
	
}
func NewBorrowingQueue(services * services.Services)BorrowingQueueController{
	return &BorrowingQueue{
		services: services,
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
	err := ctrler.services.Repos.BorrowingQueueRepository.Queue(*body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("QueueErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	_, err = ctrler.services.Repos.AccountRepository.GetAccountByIdDontIgnoreIfDeletedOrInactive(accountId)
	if err != nil {
		logger.Error(err.Error())
	} 
	
	if err != nil {
		logger.Error(err.Error())
	}
	ctx.JSON(httpresp.Success200(nil, "Added to queue successfully."))
}
func (ctrler * BorrowingQueue)GetActiveQueues(ctx * gin.Context) {
	app := ctx.GetString("requestorApp")
	if app == azuread.ClientAppClientId{
		ctrler.handleGetClientActiveQueues(ctx)
		return
	}

	if(app == azuread.AdminAppClientId){
		ctrler.getActiveQueuesGroupByBook(ctx)
		return
	}
	ctx.AbortWithStatus(http.StatusUnauthorized)
}
func(ctrler * BorrowingQueue)getActiveQueuesGroupByBook(ctx * gin.Context) {
	queues, err := ctrler.services.Repos.BorrowingQueueRepository.GetActiveQueuesGroupByBook()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error(err.Error()))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"queues": queues,
	}, "Active queues fetched."))
}

func(ctrler * BorrowingQueue)DequeueByBookId(ctx * gin.Context) {
	id := ctx.Param("id")
	err := ctrler.services.Repos.BorrowingQueueRepository.DequeueByBookId(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("DequeueByBookId"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Dequeued."))
}

func (ctrler * BorrowingQueue )handleGetClientActiveQueues(ctx * gin.Context)  {
	accountId := ctx.GetString("requestorId")
	queues, err := ctrler.services.Repos.BorrowingQueueRepository.GetClientActiveQueueItems(accountId)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetClientActiveQueues"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return 
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"queues" : queues,
	}, "Active queues fetch"))
}	

func (ctrler * BorrowingQueue)GetQueueItemsByBookId(ctx * gin.Context) {
	id := ctx.Param("id")
	items, err := ctrler.services.Repos.BorrowingQueueRepository.GetQueueItemsByBookId(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetQueueItemsByBookIdErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return 
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"items": items,
	}, "Queue items fetched."))
}

func (ctrler * BorrowingQueue)UpdateQueueItems(ctx * gin.Context) {
	body :=  UpdateQueueItemsModel{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
	}
	err = ctrler.services.Repos.BorrowingQueueRepository.UpdateQueueItems(body.Items)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("UpdateQueueItemsErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Queue items updated."))
}

func (ctrler * BorrowingQueue)DequeueItem(ctx * gin.Context) {
	id := ctx.Param("id")
	requestorApp := ctx.GetString("requestorApp")
	if requestorApp == azuread.ClientAppClientId {
		ctrler.handleClientDequeueing(ctx, id)
		return 
	}
	err := ctrler.services.Repos.BorrowingQueueRepository.DequeueItem(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("DequeueItem"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Item dequeued."))
}
func(ctrler * BorrowingQueue)handleClientDequeueing(ctx * gin.Context, id string) {
	accountId := ctx.GetString("requestorId")
	err := ctrler.services.Repos.BorrowingQueueRepository.DequeueItemByIdAndAccountId(id,accountId )
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("DequeueItemByIdAndAccountId"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Item dequeued."))
}

func (ctrler * BorrowingQueue)GetInactiveQueueItems(ctx * gin.Context){
	app := ctx.GetString("requestorApp")
	if app == azuread.ClientAppClientId{
		ctrler.handleGetClientInactiveQueues(ctx)
		return
	}

	items, err := ctrler.services.Repos.BorrowingQueueRepository.GetInactiveQueues()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetInactiveItemsErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"inactiveItems": items,
	}, "Item fetched."))
}

func (ctrler * BorrowingQueue)handleGetClientInactiveQueues(ctx * gin.Context) {
	accountId := ctx.GetString("requestorId")
	items, err := ctrler.services.Repos.BorrowingQueueRepository.GetClientInactiveQueues(accountId)
	if err != nil {
			logger.Error(err.Error(), slimlog.Error("GetClientInactiveQueuesErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"inactiveItems": items,
	}, "Item fetched."))
}