package circulation

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func CirculationRoutes(router *gin.RouterGroup) {
	var controller CirculationControllerInterface = NewCirculationController()
	router.GET("/transactions", controller.GetTransactions)
	router.GET("/transactions/:id", controller.GetTransactionById)
	router.GET("/transactions/:id/books", controller.GetTransactionBooks)
	router.POST("/checkout", middlewares.ValidateBody[CheckoutBody], controller.Checkout)
	router.PATCH("/transactions/:id",middlewares.ValidateToken ,controller.ReturnBooksById)
	router.PATCH("/transactions/:id/books/:bookId/accessions/:accessionNumber", controller.ReturnBookCopy)
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
