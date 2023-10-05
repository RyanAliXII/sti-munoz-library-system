package book

import (
	"mime/multipart"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
)

type MetadataInt struct {
	Id   int    `json:"id" binding:"required,min=1"`
	Name string `json:"name" binding:"required,gte=0"`
}
type MetadataString struct {
	Id   string    `json:"id" binding:"required,uuid"`
	Name string `json:"name" binding:"required,gte=0"`
}

type BookBody struct {
	Id            string    `json:"id" `
	Title         string    `json:"title" binding:"required"`
	Subject 	  string 	`json:"subject"`
	Description   string    `json:"description"`
	ISBN          string    `json:"isbn"  binding:"omitempty,required,min=1,max=150,isbn"`
	Copies        int       `json:"copies" binding:"required,gte=1"`
	Pages         int       `json:"pages" binding:"required,gte=0"`
	Section       MetadataInt  `json:"section"  binding:"required,gte=1,dive"`
	Publisher     MetadataString  `json:"publisher"  binding:"required,dive"`
	CostPrice     float32   `json:"costPrice"  binding:"gte=0"`
	Edition       int       `json:"edition" binding:"gte=0" `
	YearPublished int       `json:"yearPublished"  binding:"required"`
	DDC           string    `json:"ddc"  binding:"omitempty,required"`
	AuthorNumber  string    `json:"authorNumber" binding:"omitempty,required,min=1,max=50"`
	ReceivedAt    db.NullableDate `json:"receivedAt" binding:"required"`
	Authors       Authors   `json:"authors" binding:"dive"`
}


type Authors []struct {
	Id        string    `json:"id"  binding:"required,uuid"`
}

type BookCoverUploadBody struct {
	Covers []*multipart.FileHeader `form:"covers" binding:"required"`
	BookId string                  `form:"bookId" binding:"required,uuid"`
}

type AddBookCopyBody struct {
	Copies int `json:"copies" binding:"required,min=1"`

}


type WeedingBody struct {
	Remarks string `json:"remarks" binding:"required"`
}