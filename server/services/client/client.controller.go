package client

import (
	"slim-app/server/app/http/httpresp"
	"slim-app/server/model"
	"slim-app/server/repository"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ClientController struct {
	repos *repository.Repositories
}

func (ctrler *ClientController) GetAccounts(ctx *gin.Context) {
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
	var accounts []model.Account
	if len(keyword) > 0 {
		filter.Keyword = keyword
		accounts = ctrler.repos.ClientRepository.SearchAccounts(filter)
	} else {
		accounts = ctrler.repos.ClientRepository.GetAccounts(filter)
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"accounts": accounts,
	},
		"Accounts Fetched.",
	))
}

func NewClientController(repos *repository.Repositories) ClientControllerInterface {
	return &ClientController{
		repos: repos,
	}

}

type ClientControllerInterface interface {
	GetAccounts(ctx *gin.Context)
}