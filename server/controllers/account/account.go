package account

import (
	"bufio"
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/gocarina/gocsv"
)

type Account struct {
	services * services.Services
	validator   * validator.Validate
	
}

func (ctrler *Account) GetAccounts(ctx *gin.Context) {
	accountFilter := AccountFilter{}
	accountFilter.ExtractFilter(ctx)
	if len(accountFilter.Keyword) > 0 {
		accounts, metadata, err  := ctrler.services.Repos.AccountRepository.SearchAccounts(&repository.AccountFilter{
			Disabled: accountFilter.Disabled,
			Active: accountFilter.Active,
			Deleted: accountFilter.Deleted,
			Filter: accountFilter.Filter,
		})
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("SearchAccountsError"))
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
			return 
		}
		ctx.JSON(httpresp.Success200(gin.H{
			"accounts": accounts,
			"metadata": metadata,
		},
			"Accounts Fetched.",
		))
		return
	}
	accounts, metadata, err  := ctrler.services.Repos.AccountRepository.GetAccounts(&repository.AccountFilter{
		Disabled: accountFilter.Disabled,
		Active: accountFilter.Active,
		Deleted: accountFilter.Deleted,
		Filter: accountFilter.Filter,
	})
	
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetAccountsError"))
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

func(ctrler *Account) validateCSVHeaders(file multipart.File, requiredHeaders map[string]struct{}) error {
	m, err := gocsv.CSVToMaps(bufio.NewReader(file))
	if err != nil {
		return err
	}
	

	for header := range m[0] {
		delete(requiredHeaders, header)		
	}
	var missingHeaders strings.Builder
	if len(requiredHeaders) != 0 {
		idx := 0
		for header := range requiredHeaders{
			if idx == 0 {
				missingHeaders.WriteString(header)
			}else{
				missingHeaders.WriteString(fmt.Sprintf(", %s", header))
			}
			idx++;
		}
		return fmt.Errorf("missing required headers: %s", missingHeaders.String())
	}
	return nil
	
}
func (ctrler *Account) ImportAccount(ctx *gin.Context) {
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
	defer file.Close() 

	err := ctrler.validateCSVHeaders(file, map[string]struct{}{
		"id": {},
		"display_name":{},
		"surname": {},
		"given_name": {},
		"email": {},
	})
	if err != nil {
		ctx.JSON(httpresp.Fail400(gin.H{
			"error": err.Error(),
		}, "Invalid CSV structure."))
		return 
	}
	_, err = file.Seek(0, 0)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("SeekingErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknowne error occured."))
		return 
	}
	const ExpectedFileExtension = ".csv"
	fileExtension := filepath.Ext(fileHeader.Filename)
	if(fileExtension != ExpectedFileExtension){
		logger.Error("File is not csv.", slimlog.Function("AccountController.ImportAccount"), slimlog.Error("WrongFileExtensionErr"))
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
	gocsv.SetCSVReader(func(in io.Reader) gocsv.CSVReader {
		return gocsv.LazyCSVReader(in)
	})
	parseErr := gocsv.UnmarshalBytes(bytesFile, &accounts)
	if parseErr != nil {
		logger.Error(parseErr.Error(), slimlog.Function("AccountController.ImportAccount"), slimlog.Error("parseErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	validateErr := ctrler.validator.Struct(AccountSlice{
		Accounts: accounts,
	})
	if validateErr != nil {
		logger.Error(validateErr.Error(), slimlog.Function("AccountController.ImportAccount"), slimlog.Error("validateErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	newAccountsErr := ctrler.services.Repos.AccountRepository.NewAccounts(&accounts)
	
	if newAccountsErr != nil {
		logger.Error(newAccountsErr.Error(), slimlog.Function("AccountController.ImportAccount"), slimlog.Error("newAccountsErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Accounts imported."))
}
func(ctrler *Account)GetAccountRoles(ctx * gin.Context){
	accounts := ctrler.services.Repos.AccountRepository.GetAccountsWithAssignedRoles()
	ctx.JSON(httpresp.Success200(gin.H{
		"accounts": accounts, 
	}, "Accounts with assigned role fetched."))
}
func (ctrler *Account)GetAccountById(ctx * gin.Context){
	id := ctx.GetString("requestorId")

	account, err := ctrler.services.Repos.AccountRepository.GetAccountById(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetAccountByIdErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"account": account,
	}, "Account has been fetched."))
}

func (ctrler *Account)UpdateProfilePicture(ctx * gin.Context){
		profilePicture := ProfilePictureBody{}
		err := ctx.Bind(&profilePicture)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("bindErr"))
			ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
			return 
		}
		id := ctx.GetString("requestorId")
		err =ctrler.services.Repos.AccountRepository.UpdateProfilePictureById(id, profilePicture.Image)
		if err != nil{
			logger.Error(err.Error(), slimlog.Error("UpdateProfilePictureError"))
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
			return 
		}
		ctx.JSON(httpresp.Success200(nil, "Profile picture updated."))
}
// func (ctrler *Account)ActivateAccounts(ctx * gin.Context) {
// 	body := SelectedAccountIdsBody{}
// 	err := ctx.Bind(&body)
// 	if err != nil {
// 		logger.Error(err.Error(), slimlog.Error("bindErr"))
// 		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
// 		return
// 	}
// 	err = ctrler.accountRepository.ActivateAccounts(body.AccountIds)
// 	if err != nil {
// 		logger.Error(err.Error(), slimlog.Error("MarkAccountsAsActive"))
// 		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
// 		return
// 	}

// 	ctx.JSON(httpresp.Success200(nil, "Accounts activated."))
// }

func (ctrler *Account)DisableAccounts(ctx * gin.Context) {
	body := SelectedAccountIdsBody{}
	err := ctx.Bind(&body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.services.Repos.AccountRepository.DisableAccounts(body.AccountIds)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("DisableAccounts"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Accounts activated."))
}

func (ctrler *Account)DeleteAccounts(ctx * gin.Context) {
	body := SelectedAccountIdsBody{}
	err := ctx.Bind(&body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.services.Repos.AccountRepository.DeleteAccounts(body.AccountIds)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("DeleteAccounts"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	
	ctx.JSON(httpresp.Success200(nil, "Accounts deleted."))
}

func (ctrler *Account)RestoreAccounts(ctx * gin.Context) {
	body := SelectedAccountIdsBody{}
	err := ctx.Bind(&body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.services.Repos.AccountRepository.RestoreAccounts(body.AccountIds)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("RestoreAccounts"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Accounts restored."))
}

func (ctrler *Account)GetAccountStats(ctx * gin.Context) {
	requestorId := ctx.GetString("requestorId")
	stats, err :=ctrler.services.Repos.AccountRepository.GetAccountStatsById(requestorId)
	if err != nil{
		logger.Error(err.Error(), slimlog.Error("getStatsErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"stats": stats,
	}, "Accounts stats fetched."))
}
func NewAccountController(services * services.Services) AccountController{
	return &Account{
		services: services,
		validator: validator.New(),
	}

}

type AccountController interface {
	GetAccounts(ctx *gin.Context)
	ImportAccount(ctx *gin.Context)
	GetAccountRoles(ctx * gin.Context)
	GetAccountById(ctx * gin.Context)
	UpdateProfilePicture(ctx * gin.Context)
	DeleteAccounts(ctx * gin.Context)
	DisableAccounts(ctx * gin.Context)
	RestoreAccounts(ctx * gin.Context)
	ActivateBulk (ctx * gin.Context)
	ActivateAccounts(ctx * gin.Context)
	DeactiveAccounts(ctx * gin.Context)
	GetAccountStats(ctx * gin.Context)
}
