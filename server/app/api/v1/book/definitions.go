package book

import "slim-app/server/app/model"

type BookBody struct {
	Id            string         `json:"id" `
	Title         string         `json:"title" binding:"required,min=1,max=150"`
	Description   string         `json:"description" `
	ISBN          string         `json:"isbn"  binding:"required,min=1,max=150,isbn"`
	Copies        int            `json:"copies" binding:"required,gte=1"`
	Pages         int            `json:"pages" binding:"required,gte=1"`
	Section       SectionBody    `json:"section"  binding:"required"`
	Publisher     PublisherBody  `json:"publisher"  binding:"required"`
	FundSource    FundSourceBody `json:"fundSource" binding:"required"`
	CostPrice     float32        `json:"costPrice"  binding:"gte=0"`
	Edition       int            `json:"edition" binding:"gte=0" `
	YearPublished int            `json:"yearPublished"  binding:"required"`
	DDC           float64        `json:"ddc"  binding:"gte=0,lt=1000"`
	AuthorNumber  string         `json:"authorNumber" binding:"required,min=1,max=50"`
	ReceivedAt    string         `json:"receivedAt" binding:"required"`
	Authors       []model.Author `json:"authors"`
}

type SectionBody struct {
	Label string `json:"label"`
	Value int    `json:"value" binding:"required,gte=0"`
}
type PublisherBody struct {
	Label string `json:"label"`
	Value int    `json:"value" binding:"required,gte=0"`
}

type FundSourceBody struct {
	Label string `json:"label"`
	Value int    `json:"value" binding:"required,gte=0"`
}
