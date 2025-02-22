package printables

import (
	"bytes"
	"fmt"
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/browser"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
	"github.com/go-rod/rod/lib/proto"
	"github.com/ysmood/gson"
)


type BookPrintable struct{
	services * services.Services
}
func(ctrler * BookPrintable)RenderBookPrintables(ctx * gin.Context) {
	id := ctx.Param("id")
	book := ctrler.services.Repos.BookRepository.GetOne(id)
	if book.Id == "" {
		 ctx.JSON(httpresp.Fail404(nil, "Book not found."))
		 return
	}
	
	authors := make([]string, 0)

	for _, author := range book.Authors {
		authors = append(authors, author.Name)
	}
	ctx.HTML(http.StatusOK, "printables-generator/books/index", gin.H{
		"book": book,
		"authors": authors,
	})
}
func (ctrler * BookPrintable)GetBookPrintablesByBookId(ctx * gin.Context){
	browser, err := browser.NewBrowser()
	bookId := ctx.Param("id")
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("NewBrowserErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	url := fmt.Sprintf("http://localhost:5200/printables-generator/books/%s",  bookId)
	page := browser.GetPageFromPool()
	defer browser.ReturnPageToPool(page)
	err = page.Navigate(url)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("GotoErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	err = page.WaitLoad()
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("waitLoadErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	pdf, err := page.PDF( &proto.PagePrintToPDF{
		PaperWidth:  gson.Num(8.5),
		PaperHeight: gson.Num(11),
		
	})
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("PDFError"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	var buffer bytes.Buffer
	_, err = buffer.ReadFrom(pdf)
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
	}
	ctx.Data(http.StatusOK, "application/pdf", buffer.Bytes())
}
type PrintableController interface {
	RenderBookPrintables(c * gin.Context)
	GetBookPrintablesByBookId(c * gin.Context)
}

func NewBookPrintableController(services* services.Services) PrintableController {
	return &BookPrintable{
		services: services,
	}
}