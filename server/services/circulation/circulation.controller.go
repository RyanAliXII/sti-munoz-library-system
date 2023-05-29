package circulation

import (
	"fmt"
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/status"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/google/uuid"
	"github.com/jinzhu/copier"
	"go.uber.org/zap"
)

type CirculationController struct {
	circulationRepository repository.CirculationRepositoryInterface
}

func (ctrler *CirculationController) GetTransactions(ctx *gin.Context) {
	transactions := ctrler.circulationRepository.GetBorrowingTransactions()
	ctx.JSON(httpresp.Success200(gin.H{"transactions": transactions}, "Transactions fetched."))
}
func (ctrler *CirculationController) GetTransactionBooks(ctx *gin.Context) {
	ctx.JSON(httpresp.Success200(nil, "Borrowed books fetched."))
}
func (ctrler *CirculationController) GetTransactionById(ctx *gin.Context) {
	id := ctx.Param("id")
	_, err := uuid.Parse(id)
	if err != nil {
		logger.Warn("Invalid UUID value", slimlog.Function("CirculationController.GetTransactionById"), zap.String("uuid", id))
		ctx.JSON(httpresp.Fail404(nil, "Invalid id param."))
		return
	}
	transaction := ctrler.circulationRepository.GetBorrowingTransactionById(id)
	if len(transaction.Id) == 0 {
		ctx.JSON(httpresp.Fail404(nil, "Transaction not found."))
		return
	}

	ctx.JSON(httpresp.Success200(gin.H{
		"transaction": transaction,
	}, "Transaction fetched."))
}
func (ctrler *CirculationController) Checkout(ctx *gin.Context) {
	body := CheckoutBody{}
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	var accessions []model.Accession = make([]model.Accession, 0)
	copyErr := copier.Copy(&accessions, &body.Accessions)
	if copyErr != nil {
		logger.Error(copyErr.Error(), slimlog.Function("CirculationController.Checkout"))
		ctx.JSON(httpresp.Fail400(nil, "Checkout failed."))
		return
	}
	newTransactionErr := ctrler.circulationRepository.NewTransaction(body.ClientId, body.DueDate, accessions)
	if newTransactionErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Checkout success."))
}

func (ctrler *CirculationController) ReturnBooksById(ctx *gin.Context) {

	id := ctx.Param("id")
	_, idParseErr := uuid.Parse(id)
	body := ReturnBookBody{
		Remarks: "",
	}

	ctx.ShouldBindBodyWith(&body, binding.JSON)
	if idParseErr != nil {
		logger.Error(idParseErr.Error(), slimlog.Function("CirculationController.ReturnBooksById"), zap.String("id", id))
		ctx.JSON(httpresp.Fail400(nil, "Invalid id param."))
		return
	}

	returnErr := ctrler.circulationRepository.ReturnBooksByTransactionId(id, body.Remarks)
	if returnErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}

	ctx.JSON(httpresp.Success200(nil, "Books returned successfully."))
}
func (ctrler *CirculationController) ReturnBookCopy(ctx *gin.Context) {
	transactionId := ctx.Param("id")
	_, transactionIdParseErr := uuid.Parse(transactionId)
	bookId := ctx.Param("bookId")
	_, bookIdParseErr := uuid.Parse(bookId)
	accessionNumberParam := ctx.Param("accessionNumber")
	accessionNumber, numberConvErr := strconv.Atoi(accessionNumberParam)

	if numberConvErr != nil {
		ctx.JSON(httpresp.Fail404(nil, "Invalid url params."))
		return
	}
	if transactionIdParseErr != nil || bookIdParseErr != nil {
		logger.Warn("Invalid url params.", slimlog.Function("CirculationController.ReturnBookCopy"))
		ctx.JSON(httpresp.Fail500(nil, "Invalid url params."))
		return
	}
	returnCopyErr := ctrler.circulationRepository.ReturnBookCopy(transactionId, bookId, accessionNumber)
	if returnCopyErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}

	ctx.JSON(httpresp.Success200(nil, "Book copy has been returned."))
}

func (ctrler * CirculationController) AddBagItem (ctx * gin.Context){
  
	accountId, hasAccountId := ctx.Get("requestorId")
	parsedAccountId, isStr  := accountId.(string)
	if(!hasAccountId  || !isStr){
	 ctx.JSON(httpresp.Fail400(nil, "invalid account id."))
	 return
	}
	item := model.BagItem{}
	ctx.ShouldBindBodyWith(&item, binding.JSON)
	item.AccountId = parsedAccountId
     addItemErr := ctrler.circulationRepository.AddItemToBag(item)
	 if(addItemErr != nil){
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured. Please try again later."))
		return
	 }
	ctx.JSON(httpresp.Success200(nil, "Bag item has been fetched."))
}
func(ctrler  * CirculationController) GetBagItems (ctx * gin.Context){
	accountId, hasAccountId := ctx.Get("requestorId")
	parsedAccountId, isStr  := accountId.(string)
	if(!hasAccountId  || !isStr){
	 ctx.JSON(httpresp.Fail400(nil, "invalid account id."))
	 return
	}
	items := ctrler.circulationRepository.GetItemsFromBagByAccountId(parsedAccountId)
	ctx.JSON(httpresp.Success200(gin.H{
			"bag": items}, "Bag items has been fetched."))
}
func (ctrler * CirculationController) DeleteItemFromBag (ctx * gin.Context){
	accountId, hasAccountId := ctx.Get("requestorId")
	parsedAccountId, isStr  := accountId.(string)
	id := ctx.Param("id")
	if(!hasAccountId  || !isStr){
	 ctx.JSON(httpresp.Fail400(nil, "invalid account id."))
	 return
	}
	deleteErr := ctrler.circulationRepository.DeleteItemFromBag(model.BagItem{
		Id: id,
		AccountId: parsedAccountId,
	})

	if deleteErr != nil{
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured. Please try again later."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Bag item has been deleted."))
}

func (ctrler * CirculationController)CheckItemFromBag(ctx * gin.Context){
	accountId, hasAccountId := ctx.Get("requestorId")
	parsedAccountId, isStr  := accountId.(string)
	id := ctx.Param("id")
	if(!hasAccountId  || !isStr){
	 ctx.JSON(httpresp.Fail400(nil, "invalid account id."))
	 return
	}
	checkErr := ctrler.circulationRepository.CheckItemFromBag(model.BagItem{
		Id: id,
		AccountId: parsedAccountId,
	})

	if checkErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured. Please try again later."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Bag item has been added to checklist."))
}
func (ctrler * CirculationController)CheckOrUncheckAllItems(ctx * gin.Context){
	accountId, hasAccountId := ctx.Get("requestorId")
	action := ctx.Query("action")

	if action != "check" && action != "uncheck" {
		ctx.JSON(httpresp.Fail400(nil, "invalid action."))
		return 
	}
	parsedAccountId, isStr  := accountId.(string)

	if(!hasAccountId  || !isStr){
	 ctx.JSON(httpresp.Fail400(nil, "invalid account id."))
	 return
	}
	var checkErr error = nil
	if(action == "check"){
		checkErr = ctrler.circulationRepository.CheckAllItemsFromBag(parsedAccountId)
	}
	if(action == "uncheck"){
		checkErr = ctrler.circulationRepository.UncheckAllItemsFromBag(parsedAccountId)
	}
	if checkErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured. Please try again later."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Bag checklist has been updated."))
}
func (ctrler * CirculationController) DeleteAllCheckedItems (ctx * gin.Context){
	accountId, hasAccountId := ctx.Get("requestorId")
	parsedAccountId, isStr  := accountId.(string)

	if(!hasAccountId  || !isStr){
	 ctx.JSON(httpresp.Fail400(nil, "invalid account id."))
	 return
	}
	deleteErr := ctrler.circulationRepository.DeleteAllCheckedItems(parsedAccountId)
	if deleteErr != nil{
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured. Please try again later."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Bag checked item has been deleted."))
}

func (ctrler * CirculationController) CheckoutCheckedItems(ctx *gin.Context){
	accountId, hasAccountId := ctx.Get("requestorId")
	parsedAccountId, isStr  := accountId.(string)

	if(!hasAccountId  || !isStr){
	 ctx.JSON(httpresp.Fail400(nil, "invalid account id."))
	 return
	}
	checkoutErr := ctrler.circulationRepository.CheckoutCheckedItems(parsedAccountId)
	if checkoutErr != nil{
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured. Please try again later."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Books has been checked out."))
} 
func (ctrler  * CirculationController) GetOnlineBorrowedBooks(ctx * gin.Context){
	accountId, hasAccountId := ctx.Get("requestorId")
	parsedAccountId, isStr  := accountId.(string)
	requestorApp, hasRequestorApp := ctx.Get("requestorApp")
	parsedRequestorApp, isRequestorAppStr  := requestorApp.(string)
    status := ctx.Query("status")
	if(!hasAccountId  || !isStr || !hasRequestorApp || !isRequestorAppStr){
	 ctx.JSON(httpresp.Fail400(nil, "invalid account id."))
	 return
	}
	var borrowedBooks []model.OnlineBorrowedBook
    if parsedRequestorApp == azuread.ClientAppClientId{

		if(status == "all"){
			borrowedBooks = ctrler.circulationRepository.GetOnlineBorrowedBooksByAccountID(parsedAccountId)
		}else{
			borrowedBooks = ctrler.circulationRepository.GetOnlineBorrowedBooksByAccountIDAndStatus(parsedAccountId, status)
		}
		ctx.JSON(httpresp.Success200(gin.H{
			"borrowedBooks": borrowedBooks,
		}, "Borrowed books fetched."))
			return 
	}

	if parsedRequestorApp == azuread.AdminAppClientId{
		
		
		if(status == "all"){
			borrowedBooks = ctrler.circulationRepository.GetAllOnlineBorrowedBooks()
		}else{
			borrowedBooks = ctrler.circulationRepository.GetOnlineBorrowedBookByStatus(status)
		}
		ctx.JSON(httpresp.Success200(gin.H{
			"borrowedBooks": borrowedBooks,
		}, "Borrowed books fetched."))
			return 
	}
	ctx.JSON(httpresp.Fail500(nil, "Borrowed books fetched."))
	

}

func (ctrler  * CirculationController) GetOnlineBorrowedBook(ctx * gin.Context){
	id := ctx.Param("id")
	borrowedBook := ctrler.circulationRepository.GetOnlineBorrowedBookById(id)	
	ctx.JSON(httpresp.Success200(gin.H{
		"borrowedBook": borrowedBook,
	}, "Borrowed Book has been fetched."))


}
func (ctrler * CirculationController) UpdatePatchBorrowRequest(ctx * gin.Context){
	 body := UpdateBorrowRequestPartialBody{}
	 borrowRequestId := ctx.Param("id")
	 var updateErr error
	 ctx.ShouldBindBodyWith(&body, binding.JSON)
	 if  body.Status == status.OnlineBorrowStatuses.CheckedOut {
		updateErr = ctrler.circulationRepository.UpdateBorrowRequestStatusAndDueDate(model.OnlineBorrowedBook{
			Id: borrowRequestId,
			Status: body.Status,
			DueDate: body.DueDate,
		})
		if updateErr != nil{
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured. Please try again later."))
			return
		}
		ctx.JSON(httpresp.Success200(nil, "Borrowed book updated."))
		return 
	 }
	 if  len(body.Remarks) > 0 {
		updateErr = ctrler.circulationRepository.UpdateBorrowRequestStatusAndRemarks(model.OnlineBorrowedBook{
			Id: borrowRequestId,
			Status: body.Status,
			Remarks: body.Remarks,
		})
		if updateErr != nil{
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured. Please try again later."))
			return
		}
		fmt.Println("ADDING PENALTY")
		addPenaltyErr := ctrler.circulationRepository.AddPenaltyOnlineBorrowedBook(borrowRequestId)
		fmt.Println(" PENALTY ADDED")
		if addPenaltyErr != nil{
					ctx.JSON(httpresp.Fail500(nil, "Unknown error occured. Please try again later."))
					return
		}
		ctx.JSON(httpresp.Success200(nil, "Borrowed book updated."))
		return 
	 }
	 
	updateErr = ctrler.circulationRepository.UpdateBorrowRequestStatus(borrowRequestId, body.Status)
	if updateErr != nil{
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured. Please try again later."))
		return
	}

	ctx.JSON(httpresp.Success200(nil, "Borrowed book updated."))
		 
}
func NewCirculationController() CirculationControllerInterface {
	return &CirculationController{
		circulationRepository: repository.NewCirculationRepository(),
	}
}

type CirculationControllerInterface interface {
	GetTransactions(ctx *gin.Context)
	GetTransactionBooks(ctx *gin.Context)
	GetTransactionById(ctx *gin.Context)
	Checkout(ctx *gin.Context)
	GetBagItems(ctx  *gin.Context)
	AddBagItem(ctx *gin.Context )
	ReturnBooksById(ctx *gin.Context)
	ReturnBookCopy(ctx *gin.Context)
	DeleteItemFromBag (ctx * gin.Context)
	CheckItemFromBag(ctx * gin.Context)
	CheckOrUncheckAllItems(ctx* gin.Context)
	DeleteAllCheckedItems (ctx * gin.Context)
	CheckoutCheckedItems(ctx *gin.Context)
	GetOnlineBorrowedBooks(ctx * gin.Context)
	UpdatePatchBorrowRequest(ctx * gin.Context)
	GetOnlineBorrowedBook(ctx * gin.Context)
}
