package borrowing

import "github.com/RyanAliXII/sti-munoz-library-system/server/app/db"

type CheckoutBody struct {
	ClientId   string               `json:"clientId" binding:"required,uuid"`
	Accessions []CheckoutAccessions `json:"accessions" binding:"required,min=1,dive"`
}

type CheckoutAccessions struct {
	Id string `json:"id" binding:"required,uuid"`
	BookId string `json:"bookId" binding:"required,uuid" `
	DueDate db.NullableDate `json:"dueDate" binding:"required" copier:"DueDate"`
}

type UpdateBorrowStatusBody struct {
	Remarks string `json:"remarks"`
}
type UpdateBorrowStatusCheckout struct {
	Remarks string `json:"remarks"`
	DueDate db.NullableDate `json:"dueDate"`
	IsEbook bool `json:"isEbook"`
}
