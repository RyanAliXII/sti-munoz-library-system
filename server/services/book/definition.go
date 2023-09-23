package book

import (
	"mime/multipart"
	"time"
)

type MetaData struct {
	Id   int    `json:"id" binding:"required,min=1"`
	Name string `json:"name" binding:"required,gte=0"`
}

type BookBody struct {
	Id            string    `json:"id" `
	Title         string    `json:"title" binding:"required,min=1,max=150"`
	Description   string    `json:"description" `
	ISBN          string    `json:"isbn"  binding:"required,min=1,max=150,isbn"`
	Copies        int       `json:"copies" binding:"required,gte=1"`
	Pages         int       `json:"pages" binding:"required,gte=1"`
	Section       MetaData  `json:"section"  binding:"required,gte=1,dive"`
	Publisher     MetaData  `json:"publisher"  binding:"required,dive"`
	FundSource    MetaData  `json:"fundSource" binding:"required,dive"`
	CostPrice     float32   `json:"costPrice"  binding:"gte=0"`
	Edition       int       `json:"edition" binding:"gte=0" `
	YearPublished int       `json:"yearPublished"  binding:"required"`
	DDC           string    `json:"ddc"  binding:"required"`
	AuthorNumber  string    `json:"authorNumber" binding:"required,min=1,max=50"`
	ReceivedAt    time.Time `json:"receivedAt" binding:"required"`
	Authors       Authors   `json:"authors" binding:"dive"`
}

type Authors struct {
	People       PeopleAsAuthorBody `json:"people" binding:"dive"`
	Organization OrgsAsAuthor       `json:"organizations" binding:"dive"`
	Publisher    PublishersBody     `json:"publishers"  binding:"dive"`
}

type PeopleAsAuthorBody []struct {
	Id         int    `json:"id"  binding:"required,gte=1"`
	GivenName  string `json:"givenName" binding:"required,max=100,min=1"`
	MiddleName string `json:"middleName" binding:"max=100"`
	Surname    string `json:"surname" binding:"required,max=100,min=1"`
}

type OrgsAsAuthor []struct {
	Id   int    `json:"id"   binding:"required,gte=1"`
	Name string `json:"name" binding:"required,max=250,min=1"`
}
type PublishersBody []struct {
	Id   int    `json:"id" binding:"required,gte=1"`
	Name string `json:"name" binding:"required,max=150,min=1"`
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