package account

import (
	"io"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

	"github.com/gin-gonic/gin"
	"github.com/gocarina/gocsv"
)

type AccountController struct {
	accountRepository repository.AccountRepositoryInterface
	recordMetadataRepository  repository.RecordMetadataRepository
}

func (ctrler *AccountController) GetAccounts(ctx *gin.Context) {
	filter := filter.ExtractFilter(ctx)
	
	var accounts []model.Account;
	var metadata repository.Metadata;
	var metaErr error = nil
	if len(filter.Keyword) > 0 {
		accounts = ctrler.accountRepository.SearchAccounts(&filter)
		metadata, metaErr = ctrler.recordMetadataRepository.GetAccountSearchMetadata(&filter)
	}else{
		accounts = ctrler.accountRepository.GetAccounts(&filter)
		metadata, metaErr = ctrler.recordMetadataRepository.GetAccountMetadata(filter.Limit)
	}	
	if metaErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
        return
	}

	ctx.JSON(httpresp.Success200(gin.H{
		"accounts": accounts,
		"metadata": metadata,
	},
		"Accounts Fetched.",
	))
}
func (ctrler *AccountController) ImportAccount(ctx *gin.Context) {
	fileHeader, fileHeaderErr := ctx.FormFile("file")
	if fileHeaderErr != nil {
		ctx.JSON(httpresp.Fail400(nil, "No files uploaded."))
		return
	}
	file, fileErr := fileHeader.Open()
	if fileErr != nil {
		logger.Error(fileErr.Error(), slimlog.Function("AccountController.ImportAccount"), slimlog.Error("fileErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}

	bytesFile, toBytesErr := io.ReadAll(file)
	var accounts []model.Account = make([]model.Account, 0)
	if toBytesErr != nil {
		logger.Error(toBytesErr.Error(), slimlog.Function("AccountController.ImportAccount"), slimlog.Error("toBytesErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}

	parseErr := gocsv.UnmarshalBytes(bytesFile, &accounts)
	if parseErr != nil {
		logger.Error(parseErr.Error(), slimlog.Function("AccountController.ImportAccount"), slimlog.Error("parseErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	newAccountsErr := ctrler.accountRepository.NewAccounts(&accounts)
	if newAccountsErr != nil {
		logger.Error(newAccountsErr.Error(), slimlog.Function("AccountController.ImportAccount"), slimlog.Error("newAccountsErr"))
	}
	ctrler.recordMetadataRepository.InvalidateAccount()
	ctx.JSON(httpresp.Success200(nil, "Accounts imported."))
}
func(ctrler * AccountController)GetAccountRoles(ctx * gin.Context){
	accounts := ctrler.accountRepository.GetAccountsWithAssignedRoles()
	ctx.JSON(httpresp.Success200(gin.H{
		"accounts": accounts, 
	}, "Accounts with assigned role fetched."))
}
func (ctrler * AccountController)GetAccountById(ctx * gin.Context){
	id, exists := ctx.Get("requestorId")
	parsedId,isIdStr := id.(string)
	if!exists || !isIdStr {
        ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
        return
    }
	account:= ctrler.accountRepository.GetAccountById(parsedId)

	ctx.JSON(httpresp.Success200(gin.H{
		"account": account,
	}, "Account has been fetched."))
}
func NewAccountController() AccountControllerInterface {
	return &AccountController{
		accountRepository: repository.NewAccountRepository(),
		recordMetadataRepository: repository.NewRecordMetadataRepository(),
		
	}

}

type AccountControllerInterface interface {
	GetAccounts(ctx *gin.Context)
	ImportAccount(ctx *gin.Context)
	GetAccountRoles(ctx * gin.Context)
	GetAccountById(ctx * gin.Context)
}
