package borrowing

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)




type BorrowingController interface {
	HandleBorrowing(ctx * gin.Context)
}
type Borrowing struct {

}
func (ctrler *  Borrowing)HandleBorrowing(ctx * gin.Context){
	body := CheckoutBody{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		return 
	}	
	ctx.JSON(httpresp.Success200(nil, "Book has been borrowed"))
	
}
func(ctrler * Borrowing)borrowBookAsPending(ctx * gin.Context){


}
func (ctrler * Borrowing)borrowBookAsCheckedOut(ctx * gin.Context){

}
func NewBorrowingController () BorrowingController {
	return &Borrowing{}
}