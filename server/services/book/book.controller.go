package book

import (
	"slim-app/server/app/db"
	"slim-app/server/app/http/httpresp"
	"slim-app/server/model"
	"slim-app/server/repository"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/google/uuid"
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

func (ctrler *BookController) GetBooks(ctx *gin.Context) {

	const (
		DEFAULT_OFFSET = 0
		DEFAULT_LIMIT  = 50
	)

	var filter repository.Filter = repository.Filter{}
	offset := ctx.Query("offset")
	limit := ctx.Query("limit")
	keyword := ctx.Query("keyword")

	parsedOffset, offsetConvErr := strconv.Atoi(offset)
	if offsetConvErr != nil {
		filter.Offset = DEFAULT_OFFSET
	} else {
		filter.Offset = parsedOffset
	}

	parsedLimit, limitConvErr := strconv.Atoi(limit)
	if limitConvErr != nil {
		filter.Limit = DEFAULT_LIMIT
	} else {
		filter.Limit = parsedLimit
	}
	if len(keyword) > 0 {
		filter.Keyword = keyword
		books := ctrler.repos.BookRepository.Search(filter)
		ctx.JSON(httpresp.Success200(gin.H{
			"books": books,
		}, "Books fetched."))
		return
	}
	var books []model.Book = make([]model.Book, 0)
	books = ctrler.repos.BookRepository.Get()

	ctx.JSON(httpresp.Success200(gin.H{
		"books": books,
	}, "Books fetched."))
}
func (ctrler *BookController) GetBookById(ctx *gin.Context) {
	id := ctx.Param("id")

	_, parseErr := uuid.Parse(id)
	if parseErr != nil {
		ctx.JSON(httpresp.Fail404(nil, "Invalid id param."))
		return
	}
	var book model.Book = ctrler.repos.BookRepository.GetOne(id)
	if len(book.Id) == 0 {
		ctx.JSON(httpresp.Fail404(nil, "Book not found."))
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
	accessions := ctrler.repos.BookRepository.GetAccessions()
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

func (ctrler *BookController) GetAccessionByBookId(ctx *gin.Context) {
	id := ctx.Param("id")
	_, parseErr := uuid.Parse(id)
	if parseErr != nil {
		ctx.JSON(httpresp.Fail404(nil, "Invalid id param."))
		return
	}
	accessions := ctrler.repos.BookRepository.GetAccessionsByBookId(id)
	ctx.JSON(httpresp.Success200(gin.H{
		"accessions": accessions,
	}, "Accessions successfully fetched for specific book."))
}

type BookControllerInterface interface {
	NewBook(ctx *gin.Context)
	GetBooks(ctx *gin.Context)
	GetAccession(ctx *gin.Context)
	GetBookById(ctx *gin.Context)
	UpdateBook(ctx *gin.Context)
	GetAccessionByBookId(ctx *gin.Context)
}
