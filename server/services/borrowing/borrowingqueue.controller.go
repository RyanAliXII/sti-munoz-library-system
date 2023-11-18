package borrowing

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gin-gonic/gin"
)

type BorrowingQueue struct {}
type BorrowingQueueController interface {
	Queue( * gin.Context)
}

func NewBorrowingQueue()BorrowingQueueController{
	return &BorrowingQueue{}
}

func (ctrler * BorrowingQueue) Queue(ctx * gin.Context) {
	queueBody := model.BorrowingQueue{}

	fmt.Println(queueBody)
}

