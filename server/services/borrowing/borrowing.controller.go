package borrowing

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
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
	ctx.JSON(httpresp.Success200(nil, "Book has been borrowed"))
	
}
func (ctrler *Borrowing )toBorrowedBookModel(body CheckoutBody)[]model.BorrowedBook{
	borrowedBooks := make([]model.BorrowedBook, 0)	
	for _, accession := range body.Accessions {
		borrowedBooks = append(borrowedBooks, model.BorrowedBook{
			Book: model.BookJSON{
				Book: model.Book{
					Id: accession.BookId,
				},
			},
			Client: model.AccountJSON{
                  Account: model.Account{
					Id: body.ClientId,
				  },
			},
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
		borrowingRepo: repository.NewBorrowingRepository,
	}
}