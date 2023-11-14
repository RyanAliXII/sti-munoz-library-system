package account

import (
	"bufio"
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/gocarina/gocsv"
)

type AccountController struct {
	accountRepository repository.AccountRepositoryInterface
	recordMetadataRepository  repository.RecordMetadataRepository
	validator   * validator.Validate
	
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

func(ctrler * AccountController) validateHeaders(file multipart.File) error {
	m, err := gocsv.CSVToMaps(bufio.NewReader(file))
	if err != nil {
		return err
	}
	requiredHeaders := map[string]struct{}{
		"id": {},
		"display_name":{},
		"surname": {},
		"given_name": {},
		"email": {},
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
	defer file.Close()
	err := ctrler.validateHeaders(file)
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
	newAccountsErr := ctrler.accountRepository.NewAccounts(&accounts)
	
	if newAccountsErr != nil {
		logger.Error(newAccountsErr.Error(), slimlog.Function("AccountController.ImportAccount"), slimlog.Error("newAccountsErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
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

func (ctrler * AccountController)UpdateProfilePicture(ctx * gin.Context){
		profilePicture := ProfilePictureBody{}
		err := ctx.Bind(&profilePicture)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("bindErr"))
			ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
			return 
		}
		id := ctx.GetString("requestorId")
		err = ctrler.accountRepository.UpdateProfilePictureById(id, profilePicture.Image)
		if err != nil{
			logger.Error(err.Error(), slimlog.Error("UpdateProfilePictureError"))
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
			return 
		}
		ctx.JSON(httpresp.Success200(nil, "Profile picture updated."))
}
func (ctrler * AccountController)MarkAsActive(ctx * gin.Context) {
	body := SelectedAccountIdsBody{}
	err := ctx.Bind(&body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.accountRepository.MarkAccountsAsActive(body.AccountIds)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAccountsAsActive"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}

	ctx.JSON(httpresp.Success200(nil, "Accounts marked."))
}

func (ctrler * AccountController)DeleteAccounts(ctx * gin.Context) {
	body := SelectedAccountIdsBody{}
	err := ctx.Bind(&body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.accountRepository.DeleteAccounts(body.AccountIds)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("DeleteAccounts"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctrler.recordMetadataRepository.InvalidateAccount()
	ctx.JSON(httpresp.Success200(nil, "Accounts marked."))
}
func NewAccountController() AccountControllerInterface {
	return &AccountController{
		accountRepository: repository.NewAccountRepository(),
		recordMetadataRepository: repository.NewRecordMetadataRepository(repository.RecordMetadataConfig{
			CacheExpiration: time.Minute * 5,
	   }),
		validator: validator.New(),
		
	}

}

type AccountControllerInterface interface {
	GetAccounts(ctx *gin.Context)
	ImportAccount(ctx *gin.Context)
	GetAccountRoles(ctx * gin.Context)
	GetAccountById(ctx * gin.Context)
	UpdateProfilePicture(ctx * gin.Context)
	MarkAsActive(ctx * gin.Context)
	DeleteAccounts(ctx * gin.Context)
}
