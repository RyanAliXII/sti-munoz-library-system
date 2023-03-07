package account

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/acl"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/gocarina/gocsv"
)

type AccountController struct {
	accountRepository repository.AccountRepositoryInterface
	systemRepository  repository.SystemRepositoryInterface
}

func (ctrler *AccountController) GetAccounts(ctx *gin.Context) {
	fmt.Println(ctx.Get("requestorId"))
	fmt.Println(ctx.Get("requestorRole"))
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
		accounts = ctrler.accountRepository.SearchAccounts(filter)
	} else {
		accounts = ctrler.accountRepository.GetAccounts(filter)
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"accounts": accounts,
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

	bytesFile, toBytesErr := ioutil.ReadAll(file)
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
	ctx.JSON(httpresp.Success200(nil, "Accounts imported."))
}
func (ctrler *AccountController) VerifyAccount(ctx *gin.Context) {
	account := model.Account{}
	bindingErr := ctx.ShouldBindBodyWith(&account, binding.JSON)
	if bindingErr != nil {
		logger.Error(bindingErr.Error(), slimlog.Function("AccountController.VerifyAccount"), slimlog.Error("bindingErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid json body."))
		return
	}
	verifyErr := ctrler.accountRepository.VerifyAndUpdateAccount(account)
	if verifyErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Account verified."))

}
func (ctrler *AccountController) GetAccountRoleAndPermissions(ctx *gin.Context) {
	//get requestorId, the current login account id. claims from token passed by middleware.validateToken
	requestorId, _ := ctx.Get("requestorId")
	accountId, ok := requestorId.(string)
	if !ok {
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	//requestorRole, this role was assigned from Azure Active Directory not from this app.
	//The application assigned role will be ignored, if the user has assigned role from Azure Active Directory.
	//This is acquired from token claims passed by middleware.validateToken
	//value can be 'Root' or 'MIS'
	accountRole := model.Role{}
	requestorRole, hasRole := ctx.Get("requestorRole")
	if hasRole {
		role, isString := requestorRole.(string)
		if isString {
			if role == acl.Root {
				accountRole = model.Role{
					Id:          0,
					Name:        role,
					Permissions: acl.BuiltInRoles.Root,
				}
				ctx.JSON(httpresp.Success200(gin.H{
					"role": accountRole,
				}, "Role has been fetched successfully."))
				return
			}
			if role == acl.MIS {
				accountRole = model.Role{
					Id:          0,
					Name:        role,
					Permissions: acl.BuiltInRoles.MIS,
				}
				ctx.JSON(httpresp.Success200(gin.H{
					"role": accountRole,
				}, "Role has been fetched successfully."))
				return
			}
		}
	}
	//if no built-in permission fetch from db
	role, getRoleErr := ctrler.systemRepository.GetRoleByAccountId(accountId)
	if getRoleErr != nil {
		ctx.JSON(httpresp.Fail500(
			nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"role": role,
	}, "Role has been fetched successfully."))
}
func NewAccountController() AccountControllerInterface {
	return &AccountController{
		accountRepository: repository.NewAccountRepository(),
		systemRepository:  repository.NewSystemRepository(),
	}

}

type AccountControllerInterface interface {
	GetAccounts(ctx *gin.Context)
	ImportAccount(ctx *gin.Context)
	VerifyAccount(ctx *gin.Context)
	GetAccountRoleAndPermissions(ctx *gin.Context)
}
