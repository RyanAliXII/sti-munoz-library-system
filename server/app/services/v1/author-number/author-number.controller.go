package authornum

import (
	"slim-app/server/app/http/httpresp"
	"slim-app/server/app/model"
	"slim-app/server/app/pkg/cutters"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/app/repository"
	"strconv"

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
	var number cutters.AuthorNumber = ctrler.repos.AuthorNumberRepository.Generate(givenName, surname)
	ctx.JSON(httpresp.Success200(gin.H{
		"authorNumber": number,
	}, "Author number generated"))
}
func (ctrler *AuthorNumberController) GetAuthorNumbers(ctx *gin.Context) {

	const (
		DEFAULT_OFFSET = 0
		DEFAULT_LIMIT  = 50
	)

	var filter repository.Filter = repository.Filter{}
	offset := ctx.Query("offset")
	limit := ctx.Query("limit")
	keyword := ctx.Query("keyword")
	parsedOffset, offsetConvErr := strconv.Atoi(offset)
	if offsetConvErr != nil {
		filter.Offset = DEFAULT_OFFSET
	} else {
		filter.Offset = parsedOffset
	}

	parsedLimit, limitConvErr := strconv.Atoi(limit)
	if limitConvErr != nil {
		filter.Limit = DEFAULT_LIMIT
	} else {
		filter.Limit = parsedLimit
	}

	var table []model.AuthorNumber
	if len(keyword) > 0 {
		filter.Keyword = keyword
		table = ctrler.repos.AuthorNumberRepository.Search(filter)
	} else {
		table = ctrler.repos.AuthorNumberRepository.Get(filter)
	}
	ctx.JSON(httpresp.Success200(gin.H{"table": table}, "Author numbers returned."))

}
func (ctrler *AuthorNumberController) GetAuthorNumbersByInitial(ctx *gin.Context) {}

type AuthorNumberControllerInterface interface {
	GenerateAuthorNumber(ctx *gin.Context)
	GetAuthorNumbers(ctx *gin.Context)
	GetAuthorNumbersByInitial(ctx *gin.Context)
}
