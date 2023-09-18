package borrowing

import (
	"fmt"
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/status"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/google/uuid"
)

type BorrowingController interface {
	HandleBorrowing(ctx * gin.Context)
	GetBorrowRequests(ctx * gin.Context)
	GetBorrowedBooksByGroupId(ctx * gin.Context)
	UpdateBorrowingStatus(ctx * gin.Context)
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
	 err =  ctx.Bind(&body)
	 if err != nil {
		logger.Error(err.Error(), slimlog.Error("BindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	 switch(statusId){
	 	case status.BorrowStatusReturned: 
			ctrler.handleBookReturn(id, body.Remarks, ctx)
			return
	 	case status.BorrowStatusUnreturned:
			ctrler.handleBookUnreturn(id, body.Remarks, ctx)
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
	err := ctrler.borrowingRepo.MarkAsReturned(id, remarks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAsUnreturnedErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Status updated."))
}
func(ctrler * Borrowing)borrowBookAsPending(ctx * gin.Context){


}
func (ctrler * Borrowing)borrowBookAsCheckedOut(ctx * gin.Context){

}
func NewBorrowingController () BorrowingController {
	return &Borrowing{
		borrowingRepo: repository.NewBorrowingRepository(),
		settingsRepo: repository.NewSettingsRepository(),
	}
}