package book

import (
	"fmt"
	"mime/multipart"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gin-gonic/gin"
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
	Pages         int       `json:"pages" binding:"required,gte=0"`
	Section       MetadataInt  `json:"section"  binding:"required,gte=1,dive"`
	Publisher     MetadataString  `json:"publisher"  binding:"required,dive"`
	CostPrice     float32   `json:"costPrice"  binding:"gte=0"`
	Edition       int       `json:"edition" binding:"gte=0" `
	YearPublished int       `json:"yearPublished"  binding:"required"`
	DDC           string    `json:"ddc"  binding:"omitempty,required"`
	AuthorNumber  string    `json:"authorNumber" binding:"omitempty,required,min=1,max=50"`
	ReceivedAt    db.NullableDate `json:"receivedAt" binding:"required"`
	Accessions 	  []AccessionBody `json:"accessions" binding:"required,min=1,dive"`
	Authors       Authors   `json:"authors" binding:"dive"`
}
type AccessionBody struct {
	Number int `json:"number" binding:"required,min=1"`
}


type Authors []struct {
	Id        string    `json:"id"  binding:"required,uuid"`
}

type BookCoverUploadBody struct {
	Covers []*multipart.FileHeader `form:"covers" binding:"required"`
	BookId string                  `form:"bookId" binding:"required,uuid"`
}

type AddBookCopyBody struct {
	AccessionNumber int `json:"accessionNumber" binding:"required,min=1"`
}
type EbookBody struct {
	Key string `json:"key" binding:"required"`
}

type WeedingBody struct {
	Remarks string `json:"remarks" binding:"required"`
}
type MigrateBody struct {
	SectionId int `json:"sectionId" binding:"required,min=1"`
	BookIds []string `json:"bookIds" binding:"required,min=1"`
}

type BookFilter struct {
	filter.Filter
	FromYearPublished int `form:"fromYearPublished"`
	ToYearPublished int `form:"toYearPublished"`
	Tags []string `form:"tags[]"`
	Collections []int `form:"collections[]"`
	IncludeSubCollection bool `form:"includeSubCollection"`
}

type BulkAccessionUpdateBody  struct{
	Accessions []model.Accession `json:"accessions"`

}

func (body * BulkAccessionUpdateBody) ValidateDuplicateAccessionNumber()([]string, bool){
	cache := make(map[int]model.Accession, 0)
	errors := make([]string, 0)
	for _, accession := range body.Accessions {
		existedAccession, exists := cache[accession.Number]
		if exists {
			errors = append(errors, fmt.Sprintf("%s and %s has the same accession number %d.",
			 accession.Book.Title, existedAccession.Book.Title, accession.Number))
			continue
		}
		cache[accession.Number] = accession
	}
	return errors, len(errors) == 0
} 

func NewBookFilter(ctx * gin.Context) *BookFilter{
	filter := &BookFilter{}
	err := ctx.BindQuery(&filter)
	if err != nil {
		logger.Error(err.Error())
	}
	filter.Filter.ExtractFilter(ctx)

	// _, err  = time.Parse(time.DateOnly, filter.From)
	// if err != nil {
	// 	filter.From = ""
	// 	filter.To = ""
	// }
	// _, err = time.Parse(time.DateOnly, filter.To)
	// if(err != nil){
	// 	filter.From = ""
	// 	filter.To = ""
	// }
	return filter
}
