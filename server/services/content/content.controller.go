package content

import (
	"fmt"
	"os"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
)

type Content struct{
	contentRepo repository.ContentRepository
}

type ContentController interface {
	UploadFile(ctx * gin.Context)
}

func NewContentController ()ContentController{
	return &Content{
		contentRepo: repository.NewContentRepository(),
	}
}
func (ctrler * Content)UploadFile(ctx * gin.Context) {
	file, err := ctx.FormFile("file")
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("Get file err"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
	}
	path, err := ctrler.contentRepo.UploadFile(file)
	
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("Get file err"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
	}
	s3Url := os.Getenv("S3_URL")
	location := fmt.Sprintf("%s/%s", s3Url, path)
	ctx.JSON(httpresp.Success200(gin.H{
		"location": location,
	}, "Success"))
}
func (ctrler * Content)DeleteContent(ctx * gin.Context) {

}

