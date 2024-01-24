package book

import (
	"net/http"
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/gin-gonic/gin"
)


func(ctrler * BookController)ExportBooks(ctx * gin.Context){
	collectionId, err  := strconv.Atoi(ctx.Query("collectionId"))
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("ConvErrr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	fileType := ctx.Query("fileType")
	buffer, err := ctrler.bookRepository.ExportBooks(collectionId, fileType)	
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("ExportBooks"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}	
	ctx.Data(http.StatusOK,"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer.Bytes())
}
