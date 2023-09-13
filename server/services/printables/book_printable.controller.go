package printables

import (
	"bytes"
	"fmt"
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/browser"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
	"github.com/go-rod/rod/lib/proto"
	"github.com/ysmood/gson"
)


type BookPrintable struct{
	bookRepo repository.BookRepositoryInterface
}
func(p * BookPrintable)RenderBookPrintables(ctx * gin.Context) {
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
	})
}
func (p * BookPrintable)GetBookPrintablesByBookId(ctx * gin.Context){
	browser, err := browser.NewBrowser()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("NewBrowserErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
	}
	page, err := browser.Goto("http://localhost:5200/printables-generator/books/fbdc33f6-8814-4d06-843e-47c7f265ca3d")
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GotoErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
	}
	err = page.WaitLoad()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("waitLoadErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
	}
	pdf, err := page.PDF( &proto.PagePrintToPDF{
		PaperWidth:  gson.Num(8.5),
		PaperHeight: gson.Num(11),
		
	})
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("PDFError"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
	}
	// _ = utils.OutputFile("test.pdf", pdf)
	var buffer bytes.Buffer
	_, err = buffer.ReadFrom(pdf)
	if err != nil {
		logger.Error(err.Error())
	}
	ctx.Data(http.StatusOK, "application/pdf", buffer.Bytes())
}
type PrintableController interface {
	RenderBookPrintables(c * gin.Context)
	GetBookPrintablesByBookId(c * gin.Context)
}

func NewBookPrintableController() PrintableController {
	return &BookPrintable{
		bookRepo: repository.NewBookRepository(),
	}
}