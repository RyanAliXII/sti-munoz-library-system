package borrowing

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)


func BorrowingRoutes(r * gin.RouterGroup){
	ctrler := NewBorrowingController()
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
}