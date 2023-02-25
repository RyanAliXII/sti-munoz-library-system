package client

import (
	"io/ioutil"
	"slim-app/server/app/http/httpresp"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/model"
	"slim-app/server/repository"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gocarina/gocsv"
)

type ClientController struct {
	clientRepository repository.ClientRepositoryInterface
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
		accounts = ctrler.clientRepository.SearchAccounts(filter)
	} else {
		accounts = ctrler.clientRepository.GetAccounts(filter)
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"accounts": accounts,
	},
		"Accounts Fetched.",
	))
}
func (ctrler *ClientController) ImportAccount(ctx *gin.Context) {
	fileHeader, fileHeaderErr := ctx.FormFile("file")
	if fileHeaderErr != nil {
		ctx.JSON(httpresp.Fail400(nil, "No files uploaded."))
		return
	}
	file, fileErr := fileHeader.Open()
	if fileErr != nil {
		logger.Error(fileErr.Error(), slimlog.Function("ClientController.ImportAccount"), slimlog.Error("fileErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}

	bytesFile, toBytesErr := ioutil.ReadAll(file)
	var accounts []model.Account = make([]model.Account, 0)
	if toBytesErr != nil {
		logger.Error(toBytesErr.Error(), slimlog.Function("ClientController.ImportAccount"), slimlog.Error("toBytesErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}

	parseErr := gocsv.UnmarshalBytes(bytesFile, &accounts)
	if parseErr != nil {
		logger.Error(parseErr.Error(), slimlog.Function("ClientController.ImportAccount"), slimlog.Error("parseErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	newAccountsErr := ctrler.clientRepository.NewAccounts(&accounts)
	if newAccountsErr != nil {
		logger.Error(newAccountsErr.Error(), slimlog.Function("ClientController.ImportAccount"), slimlog.Error("newAccountsErr"))
	}
	ctx.JSON(httpresp.Success200(nil, "Accounts imported."))
}
func NewClientController() ClientControllerInterface {
	return &ClientController{
		clientRepository: repository.NewClientRepository(),
	}

}

type ClientControllerInterface interface {
	GetAccounts(ctx *gin.Context)
	ImportAccount(ctx *gin.Context)
}
