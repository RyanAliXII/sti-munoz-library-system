package borrowing

import "github.com/gin-gonic/gin"




type BorrowingController interface {
	HandleBorrowing(ctx * gin.Context)
}
type Borrowing struct {

}
func (ctrler *  Borrowing)HandleBorrowing(ctx * gin.Context){

}
func(ctrler * Borrowing)borrowBookAsPending(ctx * gin.Context){


}
func (ctrler * Borrowing)borrowBookAsCheckedOut(ctx * gin.Context){

}
func NewBorrowingController () BorrowingController {
	return &Borrowing{}
}