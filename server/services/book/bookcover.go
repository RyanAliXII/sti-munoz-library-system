package book

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)


func (ctrler *BookController) UploadBookCover(ctx *gin.Context) {
	body := BookCoverUploadBody{}

	bindErr := ctx.ShouldBind(&body)

	if bindErr != nil {
		logger.Error(bindErr.Error())
		ctx.JSON(httpresp.Fail400(nil, "Invalid request body."))
		return
	}

	_, parseIdErr := uuid.Parse(body.BookId)
	if parseIdErr != nil {
		ctx.JSON(httpresp.Fail400(nil, "Invalid id param."))
		return
	}
	uploadErr := ctrler.bookRepository.NewBookCover(body.BookId, body.Covers)
	if uploadErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Book covers uploaded."))
}
func (ctrler *BookController) UpdateBookCover(ctx *gin.Context) {
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
	updateCoverErr := ctrler.bookRepository.UpdateBookCover(body.BookId, body.Covers)
	if updateCoverErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Book covers updated."))
}
func (ctrler * BookController) DeleteBookCovers(ctx * gin.Context){
	bookId := ctx.Param("id")
	_, parseIdErr := uuid.Parse(bookId)
	if parseIdErr != nil {
		logger.Error(parseIdErr.Error(), slimlog.Error("parseIdErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid id param."))
		return
	}
	deleteCoverErr := ctrler.bookRepository.DeleteBookCoversByBookId(bookId)
	if deleteCoverErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Book covers deleted."))
}