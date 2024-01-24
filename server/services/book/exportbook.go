package book

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/gin-gonic/gin"
)


func(ctrler * BookController)ExportBooks(ctx * gin.Context){
	collectionId := ctx.Query("collectionId")
	collections, err := ctrler.bookRepository.GetBooksByCollectionId(collectionId)	
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetBooksByCollectionId"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}

	ctx.JSON(httpresp.Success200(gin.H{
		"books": collections,
	}, "Books fetched."))
}