package borrowing

import "github.com/RyanAliXII/sti-munoz-library-system/server/app/db"

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
	Id string `json:"id" db:"id" binding:"required,uuid"`
}
type UpdateQueueItemsBody struct {
	Items []BorrowingQueueItem `json:"items" db:"items" binding:"required,dive"`
}
