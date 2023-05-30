package circulation

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
)

type CheckoutBody struct {
	ClientId   string               `json:"clientId" binding:"required,uuid"`
	Accessions []CheckoutAccessions `json:"accessions" binding:"required,min=1,dive"`

}

type CheckoutAccessions struct {
	Number int    `json:"number" binding:"required,gte=1" copier:"Number"`
	BookId string `json:"bookId" binding:"required,uuid" copier:"BookId"`
	DueDate db.NullableDate `json:"dueDate" binding:"required" copier:"DueDate"`
}

type ReturnBookBody struct {
	Remarks string `json:"remarks"`
}

type BagItem struct {
	AccessionId  string `json:"accessionId" binding:"required,uuid"`
}

type UpdateBorrowRequestPartialBody struct {
	Status string `json:"status" binding:"required,oneof=pending approved checked-out returned cancelled unreturned"`
	Remarks string `json:"remarks" binding:"omitempty"`
	DueDate db.NullableDate `json:"dueDate" binding:"omitempty"`
}

type UpdateBorrowedBookPartialBody struct {
	Status string `json:"status" binding:"required,oneof=returned cancelled unreturned"`
	Remarks string `json:"remarks" binding:"omitempty"`
}