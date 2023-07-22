package circulation

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func CirculationRoutes(router *gin.RouterGroup) {
	var controller CirculationControllerInterface = NewCirculationController()
	router.GET("/transactions", controller.GetTransactions)

	router.GET("/transactions/:id/books", controller.GetTransactionBooks)
	router.POST("/checkout", middlewares.ValidateBody[CheckoutBody], controller.Checkout)
	router.GET("/transactions/:id", controller.GetTransactionById)
	router.PATCH("/transactions/:transactionId/books/:bookId/accessions/:number", middlewares.ValidateToken, middlewares.ValidateBody[UpdateBorrowedBookPartialBody],  controller.UpdateBorrowedBookStatus)
	router.GET("/books/:bookId/accessions/:number", middlewares.ValidateToken,  controller.GetBorrowedCopy)
	//fix for this fucking idiot limitation of gin-gonic
	// getTransactionGroup := router.Group("/transactions/:id")
	// getTransactionGroup.GET("/", controller.GetTransactionById)
	// getTransactionGroup.GET("/books/:bookId/accessions/:number", middlewares.ValidateToken,  controller.GetBorrowedCopy)
	
	

	router.POST("/bag",middlewares.ValidateToken, middlewares.ValidateBody[BagItem]  ,controller.AddBagItem)
	router.GET("/bag",middlewares.ValidateToken, controller.GetBagItems)
	router.DELETE("/bag/:id",middlewares.ValidateToken, controller.DeleteItemFromBag)
	router.PATCH("/bag/:id/checklist", middlewares.ValidateToken, controller.CheckItemFromBag)
	router.PATCH("/bag/checklist", middlewares.ValidateToken, controller.CheckOrUncheckAllItems)
	router.DELETE("/bag/checklist", middlewares.ValidateToken,  controller.DeleteAllCheckedItems)
	router.POST("/checklist/checkout", middlewares.ValidateToken, controller.CheckoutCheckedItems )
	router.GET("/online/borrowed-books", middlewares.ValidateToken, controller.GetOnlineBorrowedBooks)
	router.GET("/online/borrowed-books/:id", middlewares.ValidateToken, controller.GetOnlineBorrowedBook)
	router.PATCH("/online/borrowed-books/:id", middlewares.ValidateToken, middlewares.ValidateBody[UpdateBorrowRequestPartialBody], controller.UpdatePatchBorrowRequest)
}
