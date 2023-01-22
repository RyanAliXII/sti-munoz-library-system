package book

import (
	"fmt"
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
func (ctrler *BookController) GetBookById(ctx *gin.Context) {
	id := ctx.Param("id")
	var book model.BookGet = ctrler.repos.BookRepository.GetOne(id)
	if len(book.Id) == 0 {
		ctx.JSON(httpresp.Fail404(gin.H{
			"book": gin.H{},
		}, "Book does not exist."))
		return
	}

	authors := ctrler.repos.AuthorRepository.GetByBookId(id)
	fmt.Println(book.PublisherId)
	var bookBody BookBody = BookBody{

		Id:          book.Id,
		Title:       book.Title,
		ISBN:        book.ISBN,
		Description: book.Description,
		Copies:      book.Copies,
		Pages:       book.Pages,
		Section: SectionBody{
			Label: book.Section,
			Value: book.SectionId,
		},
		Publisher: PublisherBody{
			Label: book.Publisher,
			Value: book.PublisherId,
		},

		FundSource: FundSourceBody{
			Label: book.FundSource,
			Value: book.FundSourceId,
		},
		CostPrice:     book.CostPrice,
		Edition:       book.Edition,
		YearPublished: book.YearPublished,
		DDC:           book.DDC,
		AuthorNumber:  book.AuthorNumber,
		Authors:       authors,
		ReceivedAt:    book.ReceivedAt.Time.String(),
	}

	ctx.JSON(httpresp.Success200(gin.H{
		"book": bookBody,
	}, "Book fetched."))
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
	GetBookById(ctx *gin.Context)
}
