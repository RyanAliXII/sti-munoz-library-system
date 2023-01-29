package book

import (
	"slim-app/server/app/db"
	"slim-app/server/app/http/httpresp"
	"slim-app/server/model"
	"slim-app/server/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type BookController struct {
	repos *repository.Repositories
}

func (ctrler *BookController) NewBook(ctx *gin.Context) {
	var body NewBookBody
	ctx.ShouldBindBodyWith(&body, binding.JSON)
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
			ReceivedAt: db.NullableTime{
				Time: body.ReceivedAt,
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
		}, "model.Book does not exist."))
		return
	}

	authors := ctrler.repos.AuthorRepository.GetByBookId(id)

	var bookBody BookBody = BookBody{
		Id:          book.Id,
		Title:       book.Title,
		ISBN:        book.ISBN,
		Description: book.Description,
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
		ReceivedAt:    book.ReceivedAt.Time,
	}

	ctx.JSON(httpresp.Success200(gin.H{
		"book": bookBody,
	}, "model.Book fetched."))
}
func (ctrler *BookController) GetAccession(ctx *gin.Context) {
	accessions := ctrler.repos.BookRepository.GetAccession()
	ctx.JSON(httpresp.Success200(gin.H{
		"accessions": accessions,
	}, "Accession Fetched."))
}
func (ctrler *BookController) UpdateBook(ctx *gin.Context) {
	var body BookBody = BookBody{}
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	ctrler.repos.BookRepository.Update(model.BookUpdate{
		Book: model.Book{
			Id:            body.Id,
			Title:         body.Title,
			Description:   body.Description,
			ISBN:          body.ISBN,
			Pages:         body.Pages,
			SectionId:     body.Section.Value,
			PublisherId:   body.Publisher.Value,
			FundSourceId:  body.FundSource.Value,
			Edition:       body.Edition,
			CostPrice:     body.CostPrice,
			YearPublished: body.YearPublished,
			ReceivedAt: db.NullableTime{
				Time: body.ReceivedAt,
			},
			DDC:          body.DDC,
			AuthorNumber: body.AuthorNumber,
		},
		Authors: body.Authors,
	})
	ctx.JSON(httpresp.Success200(nil, "model.Book updated."))
}

type BookControllerInterface interface {
	NewBook(ctx *gin.Context)
	GetBook(ctx *gin.Context)
	GetAccession(ctx *gin.Context)
	GetBookById(ctx *gin.Context)
	UpdateBook(ctx *gin.Context)
}
