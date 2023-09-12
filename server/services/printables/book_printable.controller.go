package printables

import (
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
)


type Printable struct{
	bookRepo repository.BookRepositoryInterface
}
func(p * Printable)RenderBookPrintables(ctx * gin.Context) {
	id := ctx.Param("id")
	book := p.bookRepo.GetOne(id)
	if book.Id == "" {
		 ctx.JSON(httpresp.Fail404(nil, "Book not found."))
		 return
	}
	ctx.HTML(http.StatusOK, "printables-generator/books/index", book)
}

type PrintableController interface {
	RenderBookPrintables(c * gin.Context)
}

func NewPrintableController() PrintableController {
	return &Printable{
		bookRepo: repository.NewBookRepository(),
	}
}