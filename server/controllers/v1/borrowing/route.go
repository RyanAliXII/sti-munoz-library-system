package borrowing

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)


func BorrowingRoutes(r * gin.RouterGroup, services * services.Services){
	ctrler := NewBorrowingController(services)
	queueCtrler := NewBorrowingQueue(services)
		
	r.POST("/",
	middlewares.ValidatePermissions([]string{"BorrowedBook.Add"}, true),
	middlewares.ValidateBody[CheckoutBody],
	ctrler.HandleBorrowing)

	r.GET("/requests",
	middlewares.ValidatePermissions([]string{"BorrowedBook.Read"}, true),
	ctrler.GetBorrowRequests)

	r.GET("/borrowed-books", 
	ctrler.GetBorrowedBookByAccountId)
	r.GET("/borrowed-books/accessions/:accessionId", ctrler.GetBorrowedBookByAccessionId)
	r.GET("/ebooks/:id", ctrler.GetEbookByBorrowedBookId)

	r.GET("/requests/:id", 
	middlewares.ValidatePermissions([]string{"BorrowedBook.Read"}, true),
	ctrler.GetBorrowedBooksByGroupId)
	r.PATCH("/borrowed-books/:id/status",
	 middlewares.ValidatePermissions([]string{"BorrowedBook.Edit"}, true),
	 ctrler.UpdateBorrowingStatus)
	r.PATCH("/borrowed-books/return/bulk", 
	middlewares.ValidatePermissions([]string{"BorrowedBook.Edit"}, true),
	ctrler.ReturnBorrowedBooksBulk)
	r.PATCH("/borrowed-books/:id/remarks", 
	middlewares.ValidatePermissions([]string{"BorrowedBook.Edit"}, true),
	ctrler.UpdateRemarks)
	r.PATCH("/borrowed-books/:id/cancellation", ctrler.HandleCancellationByIdAndAccountId)
	r.POST("/queues", middlewares.ValidateBody[QueueBody], queueCtrler.Queue)
	r.GET("/queues", queueCtrler.GetActiveQueues)
	r.GET("/queues/history", queueCtrler.GetInactiveQueueItems)
	r.DELETE("/queues/:id",
	middlewares.ValidatePermissions([]string{"Queue.Delete"}, true),
	queueCtrler.DequeueByBookId)
	r.DELETE("/queues/items/:id",queueCtrler.DequeueItem)
	r.GET("/queues/:id",
	middlewares.ValidatePermissions([]string{"Queue.Read"}, true),
	queueCtrler.GetQueueItemsByBookId)
	r.PUT("/queues/:id",
	middlewares.ValidatePermissions([]string{"Queue.Edit"}, true),
	middlewares.ValidateBody[UpdateQueueItemsBody], queueCtrler.UpdateQueueItems)
}