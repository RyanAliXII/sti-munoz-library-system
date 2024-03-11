package book

import (
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/google/uuid"
)

type Book struct {
	services * services.Services
}

func (ctrler *Book) NewBook(ctx *gin.Context) {
	var book = model.Book{}
	err := ctx.ShouldBindBodyWith(&book, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid body."))
		return 
	}
	errorDesc, hasExisting, err := book.ValidateIfAccessionExistsOrDuplicate()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid body."))
		return 
	}
	if (hasExisting) {
		ctx.JSON(httpresp.Fail400(gin.H{
			"errors":gin.H{
				"accessions": errorDesc,
			},
		}, "Validation error."))
		return
	}
	bookId, newBookErr := ctrler.services.Repos.BookRepository.New(book)
	if newBookErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctrler.services.Repos.RecordMetadataRepository.InvalidateBook()
	ctx.JSON(httpresp.Success200(gin.H{
		"book":  gin.H{
			"id":bookId,
		},
	}, "New book added."))
}
func (ctrler * Book) HandleGetBooks(ctx * gin.Context) {
	requestorApp := ctx.GetString("requestorApp")
	switch(requestorApp){
		case azuread.AdminAppClientId:
			ctrler.getBooksAdmin(ctx)
			return
		case azuread.ClientAppClientId:
			ctrler.getBooksClient(ctx)
			return
		default:
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
    }
}	
func (ctrler *Book) getBooksAdmin(ctx *gin.Context) {
	var books []model.Book = make([]model.Book, 0)
	f := NewBookFilter(ctx)
	err := ctx.ShouldBindQuery(&f)
	if err != nil {
		logger.Error(err.Error())
	}
	books, metadata := ctrler.services.Repos.BookRepository.Get(&repository.BookFilter{
		 Filter: f.Filter,
		 FromYearPublished: f.FromYearPublished,
		 ToYearPublished: f.ToYearPublished,
		 Tags: f.Tags,
		 Collections: f.Collections,
		 IncludeSubCollection: f.IncludeSubCollection,
	})
	ctx.JSON(httpresp.Success200(gin.H{
		"books": books,
		"metadata": metadata, 
	}, "Books fetched."))
}
func (ctrler *Book) getBooksClient(ctx *gin.Context) {
	var books []model.Book = make([]model.Book, 0)
	f := NewBookFilter(ctx)
	err := ctx.ShouldBindQuery(&f)
	if err != nil {
		logger.Error(err.Error())
	}
	books, metadata := ctrler.services.Repos.BookRepository.GetClientBookView(&repository.BookFilter{
		Filter: f.Filter,
		FromYearPublished: f.FromYearPublished,
		ToYearPublished: f.ToYearPublished,
		Tags: f.Tags,
		Collections: f.Collections,
	})
	
	ctx.JSON(httpresp.Success200(gin.H{
		"books": books,
		"metadata": metadata, 
	}, "Books fetched."))
}

func (ctrler * Book) HandleGetById(ctx * gin.Context) {
	requestorApp := ctx.GetString("requestorApp")
	switch(requestorApp){
		case azuread.AdminAppClientId:
			ctrler.getBookById(ctx)
			return
		case azuread.ClientAppClientId:
			ctrler.getBookByIdOnClientView(ctx)
			return
		default:
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
    }
}
func (ctrler *Book) getBookById(ctx *gin.Context) {
	id := ctx.Param("id")

	_, parseErr := uuid.Parse(id)
	if parseErr != nil {
		ctx.JSON(httpresp.Fail404(nil, "Invalid id param."))
		return
	}
	var book model.Book = ctrler.services.Repos.BookRepository.GetOne(id)
	if len(book.Id) == 0 {
		ctx.JSON(httpresp.Fail404(nil, "Book not found."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"book": book,
	}, "Book fetched."))
}
func (ctrler *Book) getBookByIdOnClientView(ctx *gin.Context) {
	id := ctx.Param("id")
	accountId := ctx.GetString("requestorId")
	_, parseErr := uuid.Parse(id)
	if parseErr != nil {
		ctx.JSON(httpresp.Fail404(nil, "Invalid id param."))
		return
	}
	var book model.Book = ctrler.services.Repos.BookRepository.GetOneOnClientView(id)
	if len(book.Id) == 0 {
		ctx.JSON(httpresp.Fail404(nil, "Book not found."))
		return
	}
	bookStatus, err  := ctrler.services.Repos.BorrowingRepository.GetBookStatusBasedOnClient(id, accountId )
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetBookStatusBasedOnClient"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"book": book,
		"status": bookStatus,
	}, "Book fetched."))
}


func (ctrler *Book) UpdateBook(ctx *gin.Context) {
	body := model.Book{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid body."))
		return 
	}
	updateErr := ctrler.services.Repos.BookRepository.Update(body)
	if updateErr != nil {
		ctx.JSON(httpresp.Fail(500, nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "model.Book updated."))
}

func NewBookController(services * services.Services) BookController {
	return &Book{
		services: services,
	}
}

type BookController interface {
	NewBook(ctx *gin.Context)
	GetAccession(ctx *gin.Context)
	UpdateBook(ctx *gin.Context)
	GetAccessionByBookId(ctx *gin.Context)
	UploadBookCover(ctx *gin.Context)
	UpdateBookCover(ctx *gin.Context)
	DeleteBookCovers (ctx * gin.Context)
	UpdateAccessionStatus(ctx * gin.Context) 
	AddBookCopies(ctx * gin.Context)
	ImportBooks(ctx * gin.Context)
	HandleGetBooks(ctx * gin.Context) 
	HandleGetById(ctx * gin.Context)
	UploadEBook(ctx * gin.Context)
	GetEbookById(ctx * gin.Context)
	RemoveEbookById(ctx * gin.Context)
	UpdateEbookById(ctx * gin.Context)
	MigrateCollection(ctx * gin.Context)
	GetAccessionById (ctx * gin.Context) 
	ExportBooks(ctx * gin.Context)
	UpdateAccession(ctx * gin.Context)
	GetAccessionsByCollection(ctx * gin.Context)
	UpdateAccessionBulk(ctx * gin.Context)
}
