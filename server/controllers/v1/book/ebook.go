package book

import (
	"bytes"
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
)

func(ctrler * BookController) UploadEBook(ctx * gin.Context){
	id := ctx.Param("id") // book id
	body := EbookBody{}
	err := ctx.Bind(&body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.bookRepository.AddEbook(id, body.Ebook)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("AddEbookErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Ebook successfully added."))
}
func(ctrler * BookController) GetEbookById(ctx * gin.Context){
	id := ctx.Param("id") // book id
	object ,err := ctrler.bookRepository.GetEbookById(id)
	if err != nil {
		_, ok := err.(*repository.IsNotEbook)
		if ok {
			logger.Warn(err.Error())
			ctx.Data(http.StatusNotFound, "application/pdf", []byte{})
			return 
		}
		logger.Error(err.Error(), slimlog.Error("GeEbookByIdErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	defer func() {
		object.Close()
	}()
	
    ctx.Header("Content-Disposition", "attachment; filename=ebook.pdf") // Modify the filename accordingl
	var buffer bytes.Buffer
	_, err = buffer.ReadFrom(object)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("buffer.ReadFrom"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.Data(http.StatusOK, "application/pdf", buffer.Bytes())
}

func(ctrler * BookController) RemoveEbookById(ctx * gin.Context){
	id := ctx.Param("id") // book id
	err := ctrler.bookRepository.RemoveEbookById(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("RemoveBookByIdErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
    ctx.JSON(httpresp.Success200(nil, "Ebook removed."))
}

func(ctrler * BookController) UpdateEbookById(ctx * gin.Context){
	id := ctx.Param("id") // book id
	body := EbookBody{}
	err := ctx.Bind(&body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.bookRepository.UpdateEbookByBookId(id, body.Ebook)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("UpdateEbookByBookId"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
    ctx.JSON(httpresp.Success200(nil, "Ebook removed."))
}