package book

import (
	"slim-app/server/app/http/httpresp"
	"slim-app/server/app/model"
	"slim-app/server/app/repository"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type BookController struct {
	repos *repository.Repositories
}

func (ctrler *BookController) NewBook(ctx *gin.Context) {
	var body BookBody
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	parsedReceivedAt, timeParsingError := time.Parse(time.RFC3339, body.ReceivedAt)
	if timeParsingError != nil {
		ctx.JSON(httpresp.Fail400(nil, timeParsingError.Error()))
		return
	}
	var model model.BookNew = model.BookNew{
		Book: model.Book{
			Id:            body.Id,
			Title:         body.Title,
			Description:   body.Description,
			ISBN:          body.ISBN,
			Copies:        body.Copies,
			Pages:         body.Pages,
			SectionId:     body.Section.Value,
			PublisherId:   body.Publisher.Value,
			FundSourceId:  body.FundSource.Value,
			CostPrice:     body.CostPrice,
			Edition:       body.Edition,
			YearPublished: body.YearPublished,
			ReceivedAt: model.NullableTime{
				Time:  parsedReceivedAt,
				Valid: true,
			},
			DDC:          body.DDC,
			AuthorNumber: body.AuthorNumber,
		},
		Authors: body.Authors,
	}
	createErr := ctrler.repos.BookRepository.New(model)
	if createErr != nil {
		ctx.JSON(httpresp.Fail400(nil, createErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "New book added."))
}

func (ctrler *BookController) GetBook(ctx *gin.Context) {
	var books []model.BookGet = make([]model.BookGet, 0)

	books = ctrler.repos.BookRepository.Get()
	ctx.JSON(httpresp.Success200(gin.H{
		"books": books,
	}, "Books fetched."))
}
func (ctrler *BookController) GetAccession(ctx *gin.Context) {
	accessions := ctrler.repos.BookRepository.GetAccession()
	ctx.JSON(httpresp.Success200(gin.H{
		"accessions": accessions,
	}, "Accession Fetched."))
}

type BookControllerInterface interface {
	NewBook(ctx *gin.Context)
	GetBook(ctx *gin.Context)
	GetAccession(ctx *gin.Context)
}
