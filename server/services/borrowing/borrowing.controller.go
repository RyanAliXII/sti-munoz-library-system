package borrowing

import (
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
}
type Borrowing struct {
	borrowingRepo repository.BorrowingRepository
}
func (ctrler *  Borrowing)HandleBorrowing(ctx * gin.Context){
	body := CheckoutBody{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occurred."))
		return 
	}	
	borrowedBooks := ctrler.toBorrowedBookModel(body, status.BorrowStatusCheckedOut)
	err  = ctrler.borrowingRepo.BorrowBook(borrowedBooks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("checkoutErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occurred."))
	}
	ctx.JSON(httpresp.Success200(nil, "Book has been borrowed"))
	
}
func (ctrler *Borrowing )toBorrowedBookModel(body CheckoutBody, status int )[]model.BorrowedBook{
	grpId := uuid.New().String()
	borrowedBooks := make([]model.BorrowedBook, 0)	
	for _, accession := range body.Accessions {
		borrowedBooks = append(borrowedBooks, model.BorrowedBook{
			GroupId: grpId,
			AccessionId: accession.Id,
			DueDate: accession.DueDate,
			AccountId: body.ClientId,
			StatusId: status,
			
		})
	}
	return borrowedBooks
}

func(ctrler * Borrowing)borrowBookAsPending(ctx * gin.Context){


}
func (ctrler * Borrowing)borrowBookAsCheckedOut(ctx * gin.Context){

}
func NewBorrowingController () BorrowingController {
	return &Borrowing{
		borrowingRepo: repository.NewBorrowingRepository(),
	}
}