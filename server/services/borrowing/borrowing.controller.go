package borrowing

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
	"go.uber.org/zap"
)

type BorrowingController interface {
	HandleBorrowing(ctx * gin.Context)
	GetBorrowRequests(ctx * gin.Context)
	GetBorrowedBooksByGroupId(ctx * gin.Context)
	UpdateBorrowingStatus(ctx * gin.Context)
	GetBorrowedBookByAccountId(ctx * gin.Context)
}
type Borrowing struct {
	borrowingRepo repository.BorrowingRepository
	settingsRepo repository.SettingsRepositoryInterface
}
func (ctrler *  Borrowing)HandleBorrowing(ctx * gin.Context){
	body := CheckoutBody{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occurred."))
		return 
	}	
	borrowedBooks, err := ctrler.toBorrowedBookModel(body, status.BorrowStatusCheckedOut)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("toBorrowedBookModel"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occurred."))
		return
	}
	err  = ctrler.borrowingRepo.BorrowBook(borrowedBooks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("checkoutErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occurred."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Book has been borrowed"))
	
}
func (ctrler *Borrowing )toBorrowedBookModel(body CheckoutBody, status int )([]model.BorrowedBook, error){
	grpId := uuid.New().String()
	settings := ctrler.settingsRepo.Get()

	borrowedBooks := make([]model.BorrowedBook, 0)	
	if settings.DuePenalty.Value == 0 {
		return borrowedBooks, fmt.Errorf("due penalty must not be 0")
	}

	for _, accession := range body.Accessions {
		borrowedBooks = append(borrowedBooks, model.BorrowedBook{
			GroupId: grpId,
			AccessionId: accession.Id,
			DueDate: accession.DueDate,
			AccountId: body.ClientId,
			StatusId: status,
			PenaltyOnPastDue: settings.DuePenalty.Value,
			
		})
	}
	return borrowedBooks, nil
}
func (ctrler * Borrowing)GetBorrowRequests(ctx * gin.Context){
	requests, err := ctrler.borrowingRepo.GetBorrowingRequests()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetBorrowingRequestsErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"borrowRequests": requests,
	}, "Borrow requests fetched."))
}
func (ctrler * Borrowing)GetBorrowedBookByAccountId(ctx * gin.Context){
	appId, _ := ctx.Get("requestorApp")
	requestorId, _ :=ctx.Get("requestorId")
	accountId := requestorId.(string)
	if appId != azuread.ClientAppClientId {
		logger.Warn("Someone tried to access endpoints that is made for client", zap.String("endpoint", "GetBorrowedBooksByAccountId"))	
		ctx.JSON(httpresp.Fail404(nil, "Not found"))
		return
	}
	statusId, _ := strconv.Atoi(ctx.Query("statusId"))
	var borrowedBooks  []model.BorrowedBook;
	var err error = nil
	if statusId != status.BorrowStatusApproved &&
	   statusId != status.BorrowStatusPending &&
	   statusId != status.BorrowStatusCancelled &&
	   statusId != status.BorrowStatusCheckedOut &&
	   statusId != status.BorrowStatusReturned {
		borrowedBooks, err = ctrler.borrowingRepo.GetBorrowedBooksByAccountId(accountId)	
	}else{
		borrowedBooks, err = ctrler.borrowingRepo.GetBorrowedBooksByAccountIdAndStatusId(accountId,  statusId)
	}
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetBorrowedBooksErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"borrowedBooks": borrowedBooks,
	}, "Borrowed books fetched fetched."))
}
func (ctrler * Borrowing)GetBorrowedBooksByGroupId(ctx * gin.Context){
	groupId := ctx.Param("id")
	requests, err := ctrler.borrowingRepo.GetBorrowedBooksByGroupId(groupId)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetBorrowedBooksByGroupId")) 
		ctx.JSON(httpresp.Fail404(nil, "Not found"))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"borrowedBooks": requests,
	}, "Borrowed books fetched."))
}

func(ctrler * Borrowing) UpdateBorrowingStatus (ctx * gin.Context){
	 statusId, err := strconv.Atoi(ctx.Query("statusId"))
	 if err != nil {
		logger.Error(err.Error(), slimlog.Error("ConvertErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid Status Id"))
		return
	}
	 id := ctx.Param("id")
	 body := UpdateBorrowStatusBody{}
	 // do not bind to body if status id is checkout.
	 if  statusId == status.BorrowStatusApproved || statusId == status.BorrowStatusReturned || statusId == status.BorrowStatusUnreturned{
		err =  ctx.Bind(&body)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("BindErr"))
			ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
			return
		}
	 }
	
	 switch(statusId){
	 	case status.BorrowStatusReturned: 
			ctrler.handleBookReturn(id, body.Remarks, ctx)
			return
	 	case status.BorrowStatusUnreturned:
			ctrler.handleBookUnreturn(id, body.Remarks, ctx)
			return
		case status.BorrowStatusApproved:
			ctrler.handleBookApproval(id, body.Remarks, ctx)
			return
		case status.BorrowStatusCheckedOut: 
			ctrler.handleBookCheckout(id, ctx)
			return
	 }	
	 ctx.JSON(httpresp.Fail400(nil, "Invalid Action"))
	
}
func (ctrler * Borrowing)handleBookReturn(id string, remarks string, ctx * gin.Context){
	err := ctrler.borrowingRepo.MarkAsReturned(id, remarks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAsReturnedErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Status updated."))
}
func (ctrler * Borrowing)handleBookUnreturn(id string, remarks string, ctx * gin.Context){
	err := ctrler.borrowingRepo.MarkAsUnreturned(id, remarks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAsUnreturnedErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Status updated."))
}


func (ctrler * Borrowing) handleBookApproval(id string, remarks string, ctx * gin.Context){
	err := ctrler.borrowingRepo.MarkAsApproved(id, remarks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAsApproved"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Status updated."))
}
func (ctrler * Borrowing) handleBookCheckout(id string, ctx * gin.Context){
	body := UpdateBorrowStatusBodyWithDueDate{}
	err :=  ctx.Bind(&body)
	if err != nil {
	   logger.Error(err.Error(), slimlog.Error("BindErr"))
	   ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
	   return
   	}
	err = ctrler.borrowingRepo.MarkAsCheckedOut(id, body.Remarks, body.DueDate)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAsApproved"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
}
func NewBorrowingController () BorrowingController {
	return &Borrowing{
		borrowingRepo: repository.NewBorrowingRepository(),
		settingsRepo: repository.NewSettingsRepository(),
	}
}