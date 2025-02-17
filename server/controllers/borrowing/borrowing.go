package borrowing

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	_ "time/tzdata"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/status"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
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
	HandleCancellationByIdAndAccountId( ctx * gin.Context)
	GetBorrowedBookByAccountId(ctx * gin.Context)
	GetEbookByBorrowedBookId(ctx * gin.Context)
	UpdateRemarks(ctx * gin.Context)
	GetBorrowedBookByAccessionId(ctx * gin.Context)
	ReturnBorrowedBooksBulk(ctx * gin.Context)
	ExportBorrowedBooks(ctx * gin.Context)
	
}
type Borrowing struct {
	services * services.Services
}
func (ctrler *Borrowing)HandleBorrowing(ctx * gin.Context){
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
	err  = ctrler.services.Repos.BorrowingRepository.BorrowBook(borrowedBooks, borrowedEbooks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("checkoutErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occurred."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"groupId":  grpId,
	}, "Book has been borrowed"))
	
}
func (ctrler *Borrowing)GetBorrowedBookByAccessionId(ctx * gin.Context){
	accessionId := ctx.Param("accessionId")
	borrowedBook, err := ctrler.services.Repos.BorrowingRepository.GetBorrowedBooksByAccessionId(accessionId)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error(err.Error()))
		if err == sql.ErrNoRows {
			ctx.JSON(httpresp.Fail404(nil, "Not found"))
			return
		}
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"borrowedBook": borrowedBook,
	}, "OK"))
}
func (ctrler *Borrowing)ReturnBorrowedBooksBulk(ctx * gin.Context){
	body := ReturnBulkBody{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error(err.Error()))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	for _, b := range body.BorrowedBookIds{
		_, err := ctrler.services.Repos.BorrowingRepository.MarkAsReturned(b, body.Remarks)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error(err.Error()))
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
			return
		}
		
	}
	ctx.JSON(httpresp.Success200(nil, "OK"))

}
func (ctrler *Borrowing)toBorrowedBookModel(body CheckoutBody, status int, groupId string )([]model.BorrowedBook,error){
	settings := ctrler.services.Repos.SettingsRepository.Get()
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
func (ctrler *Borrowing)GetEbookByBorrowedBookId(ctx * gin.Context){
	id := ctx.Param("id")
	borrowedBook, err :=ctrler.services.Repos.BorrowingRepository.GetBorrowedEBookByIdAndStatus(id, status.BorrowStatusCheckedOut)
	clientId := ctx.GetString("requestorId")

	if clientId != borrowedBook.Client.Id {
		logger.Error(err.Error())
		ctx.JSON(httpresp.Fail404(nil, "Not found"))
		return
	}
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
	err = ctrler.isValidDueDate(borrowedBook.DueDate.ToString())
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("IsValidDueDate"))
		ctx.JSON(httpresp.Fail404(nil, "Link expired is expired."))
		return
	}
	if(len(borrowedBook.Book.Ebook) == 0){
		logger.Error("Ebook not found")
		ctx.JSON(httpresp.Fail404(nil, "Not found"))
	}
	bucket := os.Getenv("S3_DEFAULT_BUCKET")
	url, err := ctrler.services.FileStorage.GenerateGetRequestUrl(borrowedBook.Book.Ebook, bucket)
	if err != nil {
		logger.Error(err.Error())
		ctx.JSON(httpresp.Fail404(nil, "Unknown error occured"))
		return
	}
	 ctx.JSON(httpresp.Success200(gin.H{
		"book": borrowedBook.Book,
		"url": url,
	 }, ""))
	
}
func (ctrler *Borrowing)toBorrowedEbookModel(body CheckoutBody, status int, groupId string)([]model.BorrowedEBook, error){
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

func(ctrler *Borrowing) isValidDueDate (dateStr string) error {
	loc, err := time.LoadLocation("Asia/Manila")
	if err != nil{
		return err
	}
	nowTime := time.Now().In(loc)
	nowDate := time.Date(nowTime.Year(), nowTime.Month(), nowTime.Day(), 0, 0, 0, 0, nowTime.Location())
	parsedTime, err := time.Parse(time.DateOnly, dateStr)
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
func (ctrler *Borrowing)GetBorrowRequests(ctx * gin.Context){
	filter := NewBorrowingRequestFilter(ctx)
	requests,metadata, err := ctrler.services.Repos.BorrowingRepository.GetBorrowingRequests(&repository.BorrowingRequestFilter{
		From: filter.From,
		To: filter.To,
		Statuses: filter.Statuses,
		SortBy: filter.SortBy,
		Order: filter.Order,
		Filter: filter.Filter,
	})
	
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetBorrowingRequestsErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"borrowRequests": requests,
		"metadata": metadata,
	}, "Borrow requests fetched."))
}

func(ctrler * Borrowing)ExportBorrowedBooks(ctx * gin.Context){
	filter := NewBorrowingRequestFilter(ctx)
	fileType := ctx.Query("fileType")
	if fileType == ".csv"{
		data, err := ctrler.services.Repos.BorrowingRepository.GetCSVData(&repository.BorrowingRequestFilter{
			From: filter.From,
			To: filter.To,
			Statuses: filter.Statuses,
			SortBy: filter.SortBy,
			Order: filter.Order,
			Filter: filter.Filter,
		})
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("GetCSVDataErr"))
			ctx.Data(http.StatusInternalServerError, "", ([]byte{}))
			return
		}
		file, err := ctrler.services.BorrowedBookExport.ExportCSV(data)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("ExportCSVErr"))
			ctx.Data(http.StatusInternalServerError, "", ([]byte{}))
		}
		ctx.Data(http.StatusOK, "text/csv", file.Bytes())
	}
	if fileType == ".xlsx"{
		data, err := ctrler.services.Repos.BorrowingRepository.GetExcelData(&repository.BorrowingRequestFilter{
			From: filter.From,
			To: filter.To,
			Statuses: filter.Statuses,
			SortBy: filter.SortBy,
			Order: filter.Order,
			Filter: filter.Filter,
		})
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("GetCSVDataErr"))
			ctx.Data(http.StatusInternalServerError, "", ([]byte{}))
			return
		}
		file, err := ctrler.services.BorrowedBookExport.ExportExcel(data)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("ExportCSVErr"))
			ctx.Data(http.StatusInternalServerError, "", ([]byte{}))
		}
		ctx.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", file.Bytes())
	}
	ctx.Data(http.StatusBadRequest, "", []byte{})
	
}
func (ctrler *Borrowing)GetBorrowedBookByAccountId(ctx * gin.Context){
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
		borrowedBooks, err = ctrler.services.Repos.BorrowingRepository.GetBorrowedBooksByAccountId(accountId)	
	}else{
		borrowedBooks, err = ctrler.services.Repos.BorrowingRepository.GetBorrowedBooksByAccountIdAndStatusId(accountId,  statusId)
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
func (ctrler *Borrowing)GetBorrowedBooksByGroupId(ctx * gin.Context){
	groupId := ctx.Param("id")
	requests, err := ctrler.services.Repos.BorrowingRepository.GetBorrowedBooksByGroupId(groupId)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetBorrowedBooksByGroupId")) 
		ctx.JSON(httpresp.Fail404(nil, "Not found"))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"borrowedBooks": requests,
	}, "Borrowed books fetched."))
}

func (ctrler * Borrowing)UpdateRemarks(ctx * gin.Context){
	id := ctx.Param("id")
	body := UpdateBorrowStatusBody{}
	err := ctx.ShouldBind(&body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	}
	err = ctrler.services.Repos.BorrowingRepository.UpdateRemarks(id, body.Remarks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("updateRemarksErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Remarks Updated."))
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
		err =  ctx.ShouldBindBodyWith(&body, binding.JSON)
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
	returnBody := model.ReturnBook{}
	err := ctx.ShouldBindBodyWith(&returnBody, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error(err.Error()))
		ctx.JSON(httpresp.Fail400(nil, "bindErr"))
		return
	}
	fieldErr, err := returnBody.Validate()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("ValidationErr"))
		ctx.JSON(httpresp.Fail400(gin.H{
			"errors": fieldErr,
		}, "Validation error"))
		return
	}
	if !returnBody.HasAdditionaPenalty {
		result, err := ctrler.services.Repos.BorrowingRepository.MarkAsReturned(id, remarks)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("MarkAsReturnedErr"))
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
			return 
		}
		ctrler.notifyAdminsAndClientIfThereIsNextInQueue(id, result.NextAccountId)
		
	}else{
		result, err := ctrler.services.Repos.BorrowingRepository.MarkAsReturnedWithAddtionalPenalty(id, returnBody)
		fmt.Println(result.NextAccountId)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("MarkAsReturnedErr"))
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
			return 
		}
		ctrler.notifyAdminsAndClientIfThereIsNextInQueue(id, result.NextAccountId)
	}
	
	ctx.JSON(httpresp.Success200(nil, "Status updated."))
}
func (ctrler * Borrowing)notifyAdminsAndClientIfThereIsNextInQueue(id string, nextAccountId string){
	if nextAccountId == ""{
		return 
	}
	borrowedBook, err := ctrler.services.Repos.BorrowingRepository.GetBorrowedBookById(id)
	if err != nil {
		logger.Error(err.Error())
	}
	message := fmt.Sprintf(`The book titled "%s" that you hold is now pending. Please wait for approval.`, borrowedBook.Book.Title)
	err = ctrler.services.Repos.NotificationRepository.NotifyClient(model.ClientNotification{
		Message: message,
		AccountId: nextAccountId,
		Link: fmt.Sprintf("/borrowed-books?statusId=%d", status.BorrowStatusPending),
	})
	if err != nil {
		logger.Error(err.Error())
	}
	routingKey := fmt.Sprintf("notify_client_%s", nextAccountId)
	go ctrler.services.Broadcaster.Broadcast("notification", routingKey, []byte(message))
	account, err := ctrler.services.Repos.AccountRepository.GetAccountByIdDontIgnoreIfDeletedOrInactive(nextAccountId)
	if err != nil {
		logger.Error(err.Error())
	}
	message = fmt.Sprintf("%s %s has requested to borrow a book.", account.GivenName, account.Surname)
	accountIds, err := ctrler.services.Repos.NotificationRepository.NotifyAdminsWithPermission(model.AdminNotification{
		Message: message,
		Link: "/borrowing/requests",
	}, "BorrowedBook.Read")
	if err != nil {
		logger.Error(err.Error())
	}
	for _, accountId := range accountIds {
		routingKey := fmt.Sprintf("notify_admin_%s", accountId)
		go ctrler.services.Broadcaster.Broadcast("notification", routingKey, []byte(message))
	}
}
func (ctrler * Borrowing)handleUnreturn(id string, remarks string, ctx * gin.Context){
	err := ctrler.services.Repos.BorrowingRepository.MarkAsUnreturned(id, remarks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAsUnreturnedErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Status updated."))
}

func (ctrler * Borrowing) handleApproval(id string, remarks string, ctx * gin.Context){
	err := ctrler.services.Repos.BorrowingRepository.MarkAsApproved(id, remarks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAsApproved"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	borrowedBook, err := ctrler.services.Repos.BorrowingRepository.GetBorrowedBookById(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetBorrowedBookByIdErr"))
	}

	routingKey := fmt.Sprintf("notify_client_%s", borrowedBook.Client.Id)
	message := fmt.Sprintf(`Your request to borrow "%s" has been approved`, borrowedBook.Book.Title);
	err = ctrler.services.Repos.NotificationRepository.NotifyClient(model.ClientNotification{
		Message: message,
		Link: fmt.Sprintf("borrowed-books?statusId=%d", status.BorrowStatusApproved),
		AccountId: borrowedBook.Client.Id,
	})
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetBorrowedBookByIdErr"))
	}
	err = ctrler.services.Broadcaster.Broadcast("notification", routingKey, []byte(message))
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetBorrowedBookByIdErr"))
	}
	
	
	ctx.JSON(httpresp.Success200(nil, "Status updated."))
}
func (ctrler * Borrowing) handleCancellation(id string, remarks string, ctx * gin.Context){
	result, err := ctrler.services.Repos.BorrowingRepository.MarkAsCancelled(id, remarks)
	ctrler.notifyAdminsAndClientIfThereIsNextInQueue(id, result.NextAccountId)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAsCancelled"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Status updated."))
}

func (ctrler * Borrowing) HandleCancellationByIdAndAccountId( ctx * gin.Context){
	id := ctx.Param("id")
	body := UpdateBorrowStatusBody{}
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	accountId := ctx.GetString("requestorId")
	result, err := ctrler.services.Repos.BorrowingRepository.CancelByIdAndAccountId(id, body.Remarks, accountId)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("Cancel"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctrler.notifyAdminsAndClientIfThereIsNextInQueue(id, result.NextAccountId)
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
	err = ctrler.services.Repos.BorrowingRepository.MarkAsCheckedOut(id, body.Remarks, body.DueDate)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAsCheckedOut"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	borrowedBook, err := ctrler.services.Repos.BorrowingRepository.GetBorrowedBookById(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetBorrowedBookByIdErr"))
	}
	routingKey := fmt.Sprintf("notify_client_%s", borrowedBook.Client.Id)
	message := fmt.Sprintf(`You have successfully checked-out "%s"`, borrowedBook.Book.Title);
	err = ctrler.services.Repos.NotificationRepository.NotifyClient(model.ClientNotification{
		Message: message,
		Link: fmt.Sprintf("borrowed-books?statusId=%d", status.BorrowStatusCheckedOut),
		AccountId: borrowedBook.Client.Id,
	})
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetBorrowedBookByIdErr"))
	}
	err = ctrler.services.Broadcaster.Broadcast("notification", routingKey, []byte(message))
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetBorrowedBookByIdErr"))
	}
}

func NewBorrowingController(services * services.Services)BorrowingController {
	return &Borrowing{
		services: services,
	}
}