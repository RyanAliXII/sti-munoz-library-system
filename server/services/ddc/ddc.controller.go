package ddc

import (
	"slim-app/server/app/http/httpresp"
	"slim-app/server/app/pkg/dewey"
	"slim-app/server/repository"
	"strconv"

	"github.com/gin-gonic/gin"
)

type DDCController struct {
	repos *repository.Repositories
}

func (ctler *DDCController) GetDDC(ctx *gin.Context) {

	const (
		DEFAULT_OFFSET         = 0
		DEFAULT_LIMIT          = 50
		DEFAULT_SEARCH_BY      = "name"
		SEARCH_BY_CLASS_NUMBER = "number"
	)

	var filter repository.Filter = repository.Filter{}
	offset := ctx.Query("offset")
	limit := ctx.Query("limit")
	keyword := ctx.Query("keyword")
	searchBy := ctx.Query("searchBy")
	var ddc []dewey.DeweyDecimal = make([]dewey.DeweyDecimal, 0)
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
	if len(keyword) > 0 {
		filter.Keyword = keyword
		if len(searchBy) > 0 && searchBy == SEARCH_BY_CLASS_NUMBER {
			ddc = ctler.repos.DDCRepository.SearchByNumber(filter)
		} else {
			ddc = ctler.repos.DDCRepository.SearchByName(filter)
		}
		ctx.JSON(httpresp.Success200(gin.H{
			"ddc": ddc,
		}, "DDC fetched."))
		return
	}

	ddc = ctler.repos.DDCRepository.Get(filter)
	ctx.JSON(httpresp.Success200(gin.H{
		"ddc": ddc,
	}, "DDC fetched."))
}

type DDCControllerInterface interface {
	GetDDC(ctx *gin.Context)
}
