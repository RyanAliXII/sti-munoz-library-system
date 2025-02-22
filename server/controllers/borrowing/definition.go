package borrowing

import (
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gin-gonic/gin"
)

type CheckoutBody struct {
	ClientId   string               `json:"clientId" binding:"required,uuid"`
	Accessions []CheckoutAccessions `json:"accessions" binding:"dive"`
	Ebooks []Ebook `json:"ebooks" binding:"dive"`
}
type  Ebook struct {
	BookId string `json:"bookId" binding:"required"`
	DueDate db.NullableDate `json:"dueDate" binding:"required"`
}
type CheckoutAccessions struct {
	Id string `json:"id" binding:"required,uuid"`
	BookId string `json:"bookId" binding:"required,uuid" `
	DueDate db.NullableDate `json:"dueDate" binding:"required"`
}

type UpdateBorrowStatusBody struct {
	Remarks string `json:"remarks"`
}
type UpdateBorrowStatusCheckout struct {
	Remarks string `json:"remarks"`
	DueDate db.NullableDate `json:"dueDate"`
	IsEbook bool `json:"isEbook"`
}

type QueueBody struct {
	BookId string `json:"bookId" binding:"required,uuid"`
	AccountId string `json:"accountId"`
}
type BorrowingQueueItem struct {
	Id string `json:"id"  binding:"required,uuid"`
	BookId string `json:"bookId"  binding:"required,uuid"`
}
type UpdateQueueItemsBody struct {
	Items []BorrowingQueueItem `json:"items" binding:"required,dive"`
}

type UpdateQueueItemsModel struct {
	Items []model.BorrowingQueueItem `json:"items"`
}

type BorrowingRequestFilter struct {
	From  string `form:"from"`
	To string `form:"to"`
	Filter filter.Filter
	Statuses []int `form:"statuses[]"`
	SortBy string `form:"sortBy"`
	Order string `form:"order"`
}
func NewBorrowingRequestFilter(ctx * gin.Context) *BorrowingRequestFilter{
	filter := &BorrowingRequestFilter{}
	ctx.BindQuery(&filter)
	filter.Filter.ExtractFilter(ctx)
	_, err  := time.Parse(time.DateOnly, filter.From)
	if err != nil {
		filter.From = ""
		filter.To = ""
	}
	_, err = time.Parse(time.DateOnly, filter.To)
	if(err != nil){
		filter.From = ""
		filter.To = ""
	}
	return filter
}

type ReturnBulkBody struct {
	BorrowedBookIds []string `json:"borrowedBookIds"`
	Remarks string `json:"remarks"`
}