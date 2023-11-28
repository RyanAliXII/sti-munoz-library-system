package borrowing

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)


func BorrowingRoutes(r * gin.RouterGroup){
	ctrler := NewBorrowingController()
	queueCtrler := NewBorrowingQueue()
	r.Use(middlewares.ValidatePermissions("Borrowing.Access"))
	
	r.POST("/",
	middlewares.BlockRequestFromClientApp,
	middlewares.ValidateBody[CheckoutBody],
	ctrler.HandleBorrowing)

	r.GET("/requests",
	middlewares.BlockRequestFromClientApp,
	ctrler.GetBorrowRequests)

	r.GET("/borrowed-books", 
	ctrler.GetBorrowedBookByAccountId)

	r.GET("/ebooks/:id", ctrler.GetEbookByBorrowedBookId)

	r.GET("/requests/:id", 
	middlewares.BlockRequestFromClientApp,
	ctrler.GetBorrowedBooksByGroupId)
	r.PATCH("/borrowed-books/:id/status", middlewares.BlockRequestFromClientApp, ctrler.UpdateBorrowingStatus)
	r.PATCH("/borrowed-books/:id/remarks", middlewares.BlockRequestFromClientApp, ctrler.UpdateRemarks)
	r.PATCH("/borrowed-books/:id/cancellation", ctrler.HandleCancellationByIdAndAccountId)
	r.POST("/queues", middlewares.ValidateBody[QueueBody], queueCtrler.Queue)
	r.GET("/queues", queueCtrler.GetActiveQueues)
	r.GET("/queues/history", queueCtrler.GetInactiveQueueItems)
	r.DELETE("/queues/:id",middlewares.BlockRequestFromClientApp,queueCtrler.DequeueByBookId)
	r.DELETE("/queues/items/:id",queueCtrler.DequeueItem)
	r.GET("/queues/:id",middlewares.BlockRequestFromClientApp,queueCtrler.GetQueueItemsByBookId)
	r.PUT("/queues/:id",middlewares.BlockRequestFromClientApp, middlewares.ValidateBody[UpdateQueueItemsBody], queueCtrler.UpdateQueueItems)
}