package authornum

import (
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/cutters"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type AuthorNumberController struct {
	authorNumberRepository repository.AuthorNumberRepositoryInterface
}

func (ctrler *AuthorNumberController) GenerateAuthorNumber(ctx *gin.Context) {
	var givenName string = ctx.Query("givenName")
	var surname string = ctx.Query("surname")

	var title string = ctx.Query("title")

	if len(title) > 0 {
		var number cutters.AuthorNumber = ctrler.authorNumberRepository.GenerateByTitle(title)
		ctx.JSON(httpresp.Success200(gin.H{
			"authorNumber": number,
		}, "Author number generated"))
		logger.Info("Generate by title.", zap.String("title", title))
		return
	}
	if len(givenName) == 0 || len(surname) == 0 {
		ctx.JSON(httpresp.Fail400(nil, "Missing required query params."))
		return
	}

	logger.Info("Generate by author.", zap.String("given", givenName), zap.String("surname", surname))
	var number cutters.AuthorNumber = ctrler.authorNumberRepository.Generate(givenName, surname)
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
		table = ctrler.authorNumberRepository.Search(filter)
	} else {
		table = ctrler.authorNumberRepository.Get(filter)
	}
	ctx.JSON(httpresp.Success200(gin.H{"table": table}, "Author numbers returned."))

}
func (ctrler *AuthorNumberController) GetAuthorNumbersByInitial(ctx *gin.Context) {}
func NewAuthorNumberController() AuthorNumberControllerInterface {
	return &AuthorNumberController{
		authorNumberRepository: repository.NewAuthorNumberRepository(),
	}

}

type AuthorNumberControllerInterface interface {
	GenerateAuthorNumber(ctx *gin.Context)
	GetAuthorNumbers(ctx *gin.Context)
	GetAuthorNumbersByInitial(ctx *gin.Context)
}
