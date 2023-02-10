package circulation

import "time"

type CheckoutBody struct {
	ClientId   string               `json:"clientId" binding:"required,uuid"`
	Accessions []CheckoutAccessions `json:"accessions" binding:"required,min=1,dive"`
	DueDate    time.Time            `json:"dueDate" binding:"required"`
}

type CheckoutAccessions struct {
	Number int    `json:"number" binding:"required,gte=1" copier:"Number"`
	BookId string `json:"bookId" binding:"required,uuid" copier:"BookId"`
}
