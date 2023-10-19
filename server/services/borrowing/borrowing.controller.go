package borrowing

import (
	"bytes"
	"database/sql"
	"fmt"
	"strconv"
	"time"

	_ "time/tzdata"

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
	GetEbookByBorrowedBookId(ctx * gin.Context)
}
type Borrowing struct {
	borrowingRepo repository.BorrowingRepository
	bookRepo repository.BookRepositoryInterface
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
	grpId := uuid.New().String()	
	if len(body.Accessions) == 0 && len(body.Ebooks) == 0 {
		ctx.JSON(httpresp.Fail400(nil, "Validation error"))
		return 
	}
	borrowedBooks,err := ctrler.toBorrowedBookModel(body, status.BorrowStatusCheckedOut, grpId)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("toBorrowedBookModel"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occurred."))
		return
	}

	borrowedEbooks, err := ctrler.toBorrowedEbookModel(body, status.BorrowStatusCheckedOut, grpId)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("toBorrowedEBookModel"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occurred."))
		return
	}
	err  = ctrler.borrowingRepo.BorrowBook(borrowedBooks, borrowedEbooks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("checkoutErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occurred."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"groupId":  grpId,
	}, "Book has been borrowed"))
	
}
func (ctrler *Borrowing )toBorrowedBookModel(body CheckoutBody, status int, groupId string )([]model.BorrowedBook,error){

	settings := ctrler.settingsRepo.Get()

	borrowedBooks := make([]model.BorrowedBook, 0)	
	if settings.DuePenalty.Value == 0 {
		return borrowedBooks, fmt.Errorf("due penalty must not be 0")
	}

	for _, accession := range body.Accessions {
		err := ctrler.isValidDueDate(string(accession.DueDate))
		if err != nil {
			return borrowedBooks, err
		}
		borrowedBooks = append(borrowedBooks, model.BorrowedBook{
			GroupId: groupId,
			AccessionId: accession.Id,
			DueDate: accession.DueDate,
			AccountId: body.ClientId,
			StatusId: status,
			PenaltyOnPastDue: settings.DuePenalty.Value,
			
		})
	}
	return borrowedBooks, nil
}
func (ctrler * Borrowing)GetEbookByBorrowedBookId(ctx * gin.Context){
	id := ctx.Param("id")
	borrowedBook, err := ctrler.borrowingRepo.GetBorrowedBooksById(id)
	if err != nil {
		if err == sql.ErrNoRows {
			 logger.Error(err.Error(), slimlog.Error("GetBorrowedBookyId"))
			 ctx.JSON(httpresp.Fail404(nil, "Not found"))
			 return
		}
		logger.Error(err.Error(), slimlog.Error("GetBorrowedBookyId"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	err = ctrler.isValidDueDate(string(borrowedBook.DueDate))
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("IsValidDueDate"))
		ctx.JSON(httpresp.Fail404(nil, "Link expired is expired."))
		return
	}
	object, err := ctrler.bookRepo.GetEbookById(borrowedBook.Book.Id)
	if err != nil {
		_, isNotEbook := err.(*repository.IsNotEbook)
		if isNotEbook {
			logger.Error(err.Error(), slimlog.Error("GetEbookById"))
			ctx.JSON(httpresp.Fail404(nil, "Not found"))
			return
		}

		logger.Error(err.Error(), slimlog.Error("GetEbookById"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	defer object.Close()
	var buffer bytes.Buffer
	_, err = buffer.ReadFrom(object)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("buffer.ReadFrom"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	 ctx.JSON(httpresp.Success200(gin.H{
		"book": borrowedBook.Book,
		"ebook":  buffer.Bytes(),
	 }, ""))
	
}
func (ctrler * Borrowing)toBorrowedEbookModel(body CheckoutBody, status int, groupId string)([]model.BorrowedEBook, error){
	ebooks := make([]model.BorrowedEBook, 0)
	for _, ebook := range body.Ebooks{
		err := ctrler.isValidDueDate(string(ebook.DueDate))
		if err != nil {
			return ebooks, err
		}
		ebooks = append(ebooks, model.BorrowedEBook{
			GroupId: groupId,
			BookId: ebook.BookId,
			StatusId: status,
			DueDate: ebook.DueDate,
			AccountId: body.ClientId,
		})
	}
	return ebooks, nil	
}

func(ctrler * Borrowing) isValidDueDate (dateStr string) error {
	loc, err := time.LoadLocation("Asia/Manila")
	if err != nil{
		return err
	}
	nowTime := time.Now().In(loc)
	nowDate := time.Date(nowTime.Year(), nowTime.Month(), nowTime.Day(), 0, 0, 0, 0, nowTime.Location())
	layout := "2006-01-02"
	parsedTime, err := time.Parse(layout, dateStr)
	if err != nil {
		return err
	}
	parsedTime = parsedTime.In(loc)
	dueDate := time.Date(parsedTime.Year(), parsedTime.Month(), parsedTime.Day(), 0, 0, 0, 0, parsedTime.Location())
	if (dueDate.Before(nowDate) && !dueDate.Equal(nowDate)){
		return fmt.Errorf("date must greater than or equal server date")
	}
	return nil
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
	 // bind to body if status id is not checkout.
	 if  statusId != status.BorrowStatusCheckedOut {
		err =  ctx.Bind(&body)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("BindErr"))
			ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
			return
		}
	 }
	 switch(statusId){
	 	case status.BorrowStatusReturned: 
			ctrler.handleReturn(id, body.Remarks, ctx)
			return
	 	case status.BorrowStatusUnreturned:
			ctrler.handleUnreturn(id, body.Remarks, ctx)
			return
		case status.BorrowStatusApproved:
			ctrler.handleApproval(id, body.Remarks, ctx)
			return
		case status.BorrowStatusCheckedOut: 
			ctrler.handleCheckout(id, ctx)
			return
		case status.BorrowStatusCancelled: 
			ctrler.handleCancellation(id, body.Remarks, ctx)
			return
	 }	
	 ctx.JSON(httpresp.Fail400(nil, "Invalid Action"))
	
}
func (ctrler * Borrowing)handleReturn(id string, remarks string, ctx * gin.Context){
	err := ctrler.borrowingRepo.MarkAsReturned(id, remarks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAsReturnedErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Status updated."))
}
func (ctrler * Borrowing)handleUnreturn(id string, remarks string, ctx * gin.Context){
	err := ctrler.borrowingRepo.MarkAsUnreturned(id, remarks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAsUnreturnedErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Status updated."))
}

func (ctrler * Borrowing) handleApproval(id string, remarks string, ctx * gin.Context){
	err := ctrler.borrowingRepo.MarkAsApproved(id, remarks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAsApproved"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Status updated."))
}
func (ctrler * Borrowing) handleCancellation(id string, remarks string, ctx * gin.Context){
	err := ctrler.borrowingRepo.MarkAsCancelled(id, remarks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAsApproved"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Status updated."))
}
func (ctrler * Borrowing) handleCheckout(id string, ctx * gin.Context){
	body := UpdateBorrowStatusCheckout{}
	err :=  ctx.Bind(&body)
	if err != nil {
	   logger.Error(err.Error(), slimlog.Error("BindErr"))
	   ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
	   return
   	}
	err = ctrler.isValidDueDate(string(body.DueDate))
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("isValideDueDate"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.borrowingRepo.MarkAsCheckedOut(id, body.Remarks, body.DueDate)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAsCheckedOut"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
}
func NewBorrowingController () BorrowingController {
	return &Borrowing{
		borrowingRepo: repository.NewBorrowingRepository(),
		settingsRepo: repository.NewSettingsRepository(),
		bookRepo: repository.NewBookRepository(),
	}
}