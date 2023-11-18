package borrowing

import "github.com/gin-gonic/gin"

type BorrowingQueue struct {}


func (ctrler * BorrowingQueue) Queue(ctx * gin.Context) {}






type BorrowingQueueController interface {
	Queue( * gin.Context)
}