package book

import (
	"net/http"
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/gin-gonic/gin"
)


func(ctrler *Book)ExportBooks(ctx * gin.Context){
	collectionId, err  := strconv.Atoi(ctx.Query("collectionId"))
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("ConvErrr"))
		ctx.Data(http.StatusBadRequest, "application/octet-stream", []byte{})
		return 
	}
	fileType := ctx.Query("fileType")
	contentType := ""
	switch(fileType){
		case ".xlsx":
			contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		case ".csv":
			contentType = "text/csv"
		default:
			ctx.Data(http.StatusBadRequest, "application/octet-stream", []byte{})
			return
	}
	
	buffer, err := ctrler.services.Repos.BookRepository.ExportBooks(collectionId, fileType)	
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("ExportBooks"))
		ctx.Data(http.StatusInternalServerError, "application/octet-stream", []byte{})
		return
	}
	
	ctx.Data(http.StatusOK, contentType, buffer.Bytes())
}
