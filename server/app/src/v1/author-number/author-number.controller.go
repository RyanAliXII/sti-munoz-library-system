package authornumsrc

import (
	"slim-app/server/app/http/httpresp"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/app/repository"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type AuthorNumberController struct {
	repos *repository.Repositories
}

var logger *zap.Logger = slimlog.GetInstance()

func (ctrler *AuthorNumberController) GenerateAuthorNumber(ctx *gin.Context) {
	var givenName string = ctx.Query("givenName")
	var surname string = ctx.Query("surname")
	if len(givenName) == 0 || len(surname) == 0 {
		ctx.JSON(httpresp.Fail400(nil, "Missing required query params."))
		return
	}
	logger.Info("NAME", zap.String("given", givenName), zap.String("surname", surname))
	var number string = ctrler.repos.AuthorNumberRepository.Generate(givenName, surname)
	ctx.JSON(httpresp.Success200(gin.H{
		"authorNumber": number,
	}, "Author number generated"))
}
func (ctrler *AuthorNumberController) GetAuthorNumbers(ctx *gin.Context) {

	const (
		OBJECT  string = "object"
		ARRAY   string = "array"
		GROUPED string = "grouped"
	)

	format := ctx.Query("format")         // expected value is "array" and "object"
	collection := ctx.Query("collection") //expected value is grouped

	if format == OBJECT {
		if collection == GROUPED {
			ctx.JSON(httpresp.Success200(gin.H{"table": ctrler.repos.AuthorNumberRepository.GetGroupedObjects()}, "Returned in object format, grouped by first initial letter of surname."))
			return
		}
	}
	if format == ARRAY {
		if collection == GROUPED {
			ctx.JSON(httpresp.Success200(gin.H{"table": ctrler.repos.AuthorNumberRepository.GetGroupedArray()}, "Returned in array format, grouped by first initial letter of surname."))
			return
		}
		ctx.JSON(httpresp.Success200(gin.H{"table": ctrler.repos.AuthorNumberRepository.GetDefaultArray()}, "Returned in array format, ungrouped."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{"table": ctrler.repos.AuthorNumberRepository.Get()}, "Returned in object format, ungrouped."))

}
func (ctrler *AuthorNumberController) GetAuthorNumbersByInitial(ctx *gin.Context) {}

type AuthorNumberControllerInterface interface {
	GenerateAuthorNumber(ctx *gin.Context)
	GetAuthorNumbers(ctx *gin.Context)
	GetAuthorNumbersByInitial(ctx *gin.Context)
}
