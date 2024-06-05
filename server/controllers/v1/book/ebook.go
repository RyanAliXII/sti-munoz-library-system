package book

import (
	"fmt"
	"os"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/gin-gonic/gin"
	"github.com/jaevor/go-nanoid"
)

func(ctrler *Book) UploadEBook(ctx * gin.Context){
	//id := ctx.Param("id") // book id
	body := EbookBody{}
	err := ctx.Bind(&body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	// err = ctrler.services.Repos.BookRepository.AddEbook(id, body.Ebook)
	// if err != nil {
	// 	logger.Error(err.Error(), slimlog.Error("AddEbookErr"))
	// 	ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
	// 	return
	// }
	ctx.JSON(httpresp.Success200(nil, "Ebook successfully added."))
}
func(ctrler *Book) GetEbookById(ctx * gin.Context){
	 
	id := ctx.Param("id") // book id
	book := ctrler.services.Repos.BookRepository.GetOne(id)
	if(len(book.Ebook) == 0){
		ctx.JSON(httpresp.Success200(gin.H{"url":""}, "Url fetched."))
		return
	} 
	bucket := os.Getenv("S3_DEFAULT_BUCKET")
	url, err := ctrler.services.FileStorage.GenerateGetRequestUrl(book.Ebook, bucket)
	if err != nil {
	   logger.Error(err.Error(), slimlog.Error("GeEbookByIdErr"))
	   ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
	   return 
	}
	ctx.JSON(httpresp.Success200(gin.H{"url": url}, "Url fetched."))
}

func(ctrler *Book) RemoveEbookById(ctx * gin.Context){
	id := ctx.Param("id") // book id
	err := ctrler.services.Repos.BookRepository.RemoveEbookById(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("RemoveBookByIdErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
    ctx.JSON(httpresp.Success200(nil, "Ebook removed."))
}

func(ctrler *Book) UpdateEbookById(ctx * gin.Context){
	id := ctx.Param("id") // book id
	body := EbookBody{}
	err := ctx.Bind(&body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.services.Repos.BookRepository.UpdateEbookByBookId(id, body.Key)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("UpdateEbookByBookId"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
    ctx.JSON(httpresp.Success200(nil, "Ebook removed."))
}

func(ctrler *Book)GenerateEbookUploadRequestUrl(ctx * gin.Context){
	nanoid , err := nanoid.Standard(21)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), slimlog.Error("GenerateUploadRequestUrl"))
		ctx.JSON(httpresp.Fail500(gin.H{}, "Unknown error occured."))
		return
	}
	objectName := fmt.Sprintf("ebook/%s%s", nanoid(), ".pdf")
	bucket := os.Getenv("S3_DEFAULT_BUCKET")
	url, err := ctrler.services.FileStorage.GenerateUploadRequestUrl(objectName, bucket )
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), slimlog.Error("GenerateUploadRequestUrl"))
		ctx.JSON(httpresp.Fail500(gin.H{}, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"url": url,
		"key" : objectName,
	}, "Url generated."))
}