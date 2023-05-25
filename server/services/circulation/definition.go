package circulation

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
)

type CheckoutBody struct {
	ClientId   string               `json:"clientId" binding:"required,uuid"`
	Accessions []CheckoutAccessions `json:"accessions" binding:"required,min=1,dive"`
	DueDate    db.NullableDate           `json:"dueDate" binding:"required"`
}

type CheckoutAccessions struct {
	Number int    `json:"number" binding:"required,gte=1" copier:"Number"`
	BookId string `json:"bookId" binding:"required,uuid" copier:"BookId"`
}

type ReturnBookBody struct {
	Remarks string `json:"remarks"`
}

type BagItem struct {
	AccessionId  string `json:"accessionId" binding:"required,uuid"`
}

type UpdateBorrowRequestPartialBody struct {
	Status string `json:"status" binding:"required,oneof=pending approved checked-out returned cancelled"`
	Remarks string `json:"remarks" binding:"omitempty"`
	DueDate db.NullableDate `json:"dueDate" binding:"omitempty"`
}