package content

import (
	"fmt"
	"os"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

type Content struct{
	services * services.Services
}
type ContentController interface {
	UploadFile(ctx * gin.Context)
}
func NewContentController (services * services.Services)ContentController{
	return &Content{
		services: services,
	}
}
func (ctrler * Content)UploadFile(ctx * gin.Context) {
	file, err := ctx.FormFile("file")
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("Get file err"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
	}
	path, err := ctrler.services.Repos.ContentRepository.UploadFile(file)
	
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("Get file err"))
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

