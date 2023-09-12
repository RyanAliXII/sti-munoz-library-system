package printables

import (
	"fmt"
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
	authors := make([]string, 0)
	for _, author := range book.Authors.People {
		authors = append(authors, fmt.Sprintf("%s %s", author.GivenName, author.Surname))
	}
	for _, author := range book.Authors.Organizations {
		authors = append(authors, author.Name)
	}
	for _, author := range book.Authors.Publishers {
		authors = append(authors,author.Name)
	}
	ctx.HTML(http.StatusOK, "printables-generator/books/index", gin.H{
		"book": book,
		"authors": authors,
		"formateddEdition": ordinal(book.Edition),
	})
}
func ordinal(n int) string {
    if n >= 11 && n <= 13 {
        return fmt.Sprintf("%dth", n)
    }

    switch n % 10 {
    case 1:
        return fmt.Sprintf("%dst", n)
    case 2:
        return fmt.Sprintf("%dnd", n)
    case 3:
        return fmt.Sprintf("%drd", n)
    default:
        return fmt.Sprintf("%dth", n)
    }
}
type PrintableController interface {
	RenderBookPrintables(c * gin.Context)
}

func NewPrintableController() PrintableController {
	return &Printable{
		bookRepo: repository.NewBookRepository(),
	}
}