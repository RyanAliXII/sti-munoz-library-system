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
		fmt.Println("ERROR")
	}
	var model model.Book = model.Book{
		Id:            body.Id,
		Title:         body.Title,
		Description:   body.Description,
		ISBN:          body.ISBN,
		Copies:        body.Copies,
		Pages:         body.Pages,
		SectionId:     body.SectionId,
		PublisherId:   body.PublisherId,
		FundSourceId:  body.FundSourceId,
		CostPrice:     body.CostPrice,
		Edition:       body.Edition,
		YearPublished: body.YearPublished,
		ReceivedAt: model.NullTimeCustom{
			Time:  parsedReceivedAt,
			Valid: true,
		},
		DDC:          body.DDC,
		AuthorNumber: body.AuthorNumber,
	}
	ctrler.repos.BookRepository.New(model)
	ctx.JSON(httpresp.Success200(nil, "New book added."))
}

type BookControllerInterface interface {
	NewBook(ctx *gin.Context)
}
