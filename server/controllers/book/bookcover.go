package book

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)


func (ctrler *Book) UploadBookCover(ctx *gin.Context) {
	body := BookCoverUploadBody{}
	err := ctx.ShouldBind(&body)
	if err != nil {
		logger.Error(err.Error())
		ctx.JSON(httpresp.Fail400(nil, "Invalid request body."))
		return
	}
	_, err = uuid.Parse(body.BookId)
	if err != nil {
		logger.Error(err.Error())
		ctx.JSON(httpresp.Fail400(nil, "Invalid id param."))
		return
	}
	result, err := ctrler.services.BookCoverService.NewCovers(body.BookId, body.Covers)
	if err != nil {
		logger.Error(err.Error())
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	err = ctrler.services.Repos.BookRepository.NewCovers(body.BookId, result)
	if err != nil {
		deleteErr := ctrler.services.BookCoverService.DeleteCovers(result)
		if deleteErr != nil {
			logger.Error(fmt.Sprintf("Error deleting already uploaded images: %s", err.Error()))
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
			return 
		}
		logger.Error(err.Error())
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Book covers uploaded."))
}
func (ctrler *Book) UpdateBookCover(ctx *gin.Context) {
	body := BookCoverUploadBody{}
	bindErr := ctx.ShouldBind(&body)
	if bindErr != nil {
		ctx.JSON(httpresp.Fail400(nil, "Invalid request body."))
		return
	}
	_, parseIdErr := uuid.Parse(body.BookId)
	if parseIdErr != nil {
		ctx.JSON(httpresp.Fail400(nil, "Invalid id param."))
		return
	}
	uploaded, deleted, err := ctrler.services.BookCoverService.UpdateBookCovers(body.BookId, body.Covers)
	if err != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	updateCoverErr := ctrler.services.Repos.BookRepository.UpdateCovers(body.BookId, uploaded, deleted)
	if updateCoverErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Book covers updated."))
}
func (ctrler *Book) DeleteBookCovers(ctx * gin.Context){
	bookId := ctx.Param("id")
	_, err := uuid.Parse(bookId)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("parseIdErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid id param."))
		return
	}
	err = ctrler.services.BookCoverService.DeleteCoversByBook(bookId)
	if err != nil {
		logger.Error(err.Error())
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	err = ctrler.services.Repos.BookRepository.DeleteBookCoversByBookId(bookId)
	if err != nil {
		logger.Error(err.Error())
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Book covers deleted."))
}