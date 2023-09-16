package borrowing

import "github.com/gin-gonic/gin"




type BorrowingController interface {
	BorrowBookAsPending(ctx * gin.Context)
	BorrowBookAsCheckedOut(ctx * gin.Context)

}
type Borrowing struct {

}
func(ctrler * Borrowing)BorrowBookAsPending(ctx * gin.Context){


}
func (ctrler * Borrowing)BorrowBookAsCheckedOut(ctx * gin.Context){

}



func NewBorrowingController () BorrowingController {
	return &Borrowing{}
}