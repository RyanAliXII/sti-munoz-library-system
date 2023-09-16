package borrowing

import "github.com/RyanAliXII/sti-munoz-library-system/server/app/db"

type CheckoutBody struct {
	ClientId   string               `json:"clientId" binding:"required,uuid"`
	Accessions []CheckoutAccessions `json:"accessions" binding:"required,min=1,dive"`
}

type CheckoutAccessions struct {
	Number int    `json:"number" binding:"required,gte=1" `
	BookId string `json:"bookId" binding:"required,uuid" `
	DueDate db.NullableDate `json:"dueDate" binding:"required" copier:"DueDate"`
}



