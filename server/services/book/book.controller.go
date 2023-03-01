package book

import (
	"slim-app/server/app/http/httpresp"
	"slim-app/server/model"
	"slim-app/server/repository"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/google/uuid"
)

type BookController struct {
	bookRepository repository.BookRepositoryInterface
}

func (ctrler *BookController) NewBook(ctx *gin.Context) {
	var book = model.Book{}
	ctx.ShouldBindBodyWith(&book, binding.JSON)
	bookId, newBookErr := ctrler.bookRepository.New(book)
	if newBookErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"book": gin.H{
			"id": bookId,
		},
	}, "New book added."))
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
		books := ctrler.bookRepository.Search(filter)
		ctx.JSON(httpresp.Success200(gin.H{
			"books": books,
		}, "Books fetched."))
		return
	}
	var books []model.Book = make([]model.Book, 0)
	books = ctrler.bookRepository.Get()

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
	var book model.Book = ctrler.bookRepository.GetOne(id)
	if len(book.Id) == 0 {
		ctx.JSON(httpresp.Fail404(nil, "Book not found."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"book": book,
	}, "model.Book fetched."))
}
func (ctrler *BookController) GetAccession(ctx *gin.Context) {
	accessions := ctrler.bookRepository.GetAccessions()
	ctx.JSON(httpresp.Success200(gin.H{
		"accessions": accessions,
	}, "Accession Fetched."))
}

func (ctrler *BookController) UpdateBook(ctx *gin.Context) {
	body := model.Book{}
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	updateErr := ctrler.bookRepository.Update(body)
	if updateErr != nil {
		ctx.JSON(httpresp.Fail(500, nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "model.Book updated."))
}

func (ctrler *BookController) GetAccessionByBookId(ctx *gin.Context) {
	id := ctx.Param("id")
	_, parseErr := uuid.Parse(id)
	if parseErr != nil {
		ctx.JSON(httpresp.Fail404(nil, "Invalid id param."))
		return
	}
	accessions := ctrler.bookRepository.GetAccessionsByBookId(id)
	ctx.JSON(httpresp.Success200(gin.H{
		"accessions": accessions,
	}, "Accessions successfully fetched for specific book."))
}

func (ctrler *BookController) UploadBookCover(ctx *gin.Context) {
	body := BookCoverUploadBody{}
	bindErr := ctx.ShouldBind(&body)

	if bindErr != nil {
		ctx.JSON(httpresp.Fail400(nil, "Invalid request body."))
		return
	}
	uploadErr := ctrler.bookRepository.UploadBookCover(body.BookId, body.Covers)
	if uploadErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Book covers uploaded."))
}
func NewBookController() BookControllerInterface {
	return &BookController{
		bookRepository: repository.NewBookRepository(),
	}
}

type BookControllerInterface interface {
	GetBooks(ctx *gin.Context)
	NewBook(ctx *gin.Context)
	GetAccession(ctx *gin.Context)
	GetBookById(ctx *gin.Context)
	UpdateBook(ctx *gin.Context)
	GetAccessionByBookId(ctx *gin.Context)
	UploadBookCover(ctx *gin.Context)
}
