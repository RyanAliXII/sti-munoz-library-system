package system

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/acl"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/crypt"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type SystemController struct {
	systemRepository repository.SystemRepositoryInterface
	accountRepository repository.AccountRepositoryInterface
	settingsRepository repository.SettingsRepositoryInterface
}

func (ctrler *SystemController) GetModules(ctx *gin.Context) {

	ctx.JSON(httpresp.Success200(gin.H{
		"modules": acl.Modules,
	}, "Permissions fetched."))
}
func (ctrler *SystemController) CreateRole(ctx *gin.Context) {
	// role := model.Role{}
	// bindingErr := ctx.ShouldBindBodyWith(&role, binding.JSON)
	// if bindingErr != nil {
	// 	logger.Error(bindingErr.Error(), slimlog.Function("SystemController.CreateRole"), slimlog.Error("bindingErr"))
	// 	ctx.JSON(httpresp.Fail400(nil, "Invalid json body."))
	// 	return
	// }
	// role.Permissions = acl.Validate(role.Permissions)
	// insertErr := ctrler.systemRepository.NewRole(role)
	// if insertErr != nil {
	// 	ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
	// 	return
	// }
	ctx.JSON(httpresp.Success200(nil, "Role has been created successfully."))
}
func (ctrler *SystemController) UpdateRole(ctx *gin.Context) {
	// role := model.Role{}
	// bindingErr := ctx.ShouldBindBodyWith(&role, binding.JSON)
	// id, parseIdErr := strconv.Atoi(ctx.Param("id"))
	// if parseIdErr != nil {
	// 	logger.Error("Invalid param id.", slimlog.Function("SystemController.UpdateRole"), slimlog.Error("parseIdErr"))
	// 	return
	// }
	// if bindingErr != nil {
	// 	logger.Error(bindingErr.Error(), slimlog.Function("SystemController.UpdateRole"), slimlog.Error("bindingErr"))
	// 	ctx.JSON(httpresp.Fail400(nil, "Invalid json body."))
	// 	return
	// }
	// // role.Permissions = acl.Validate(role.Permissions)	
	// // role.Id = id
	// // updateErr := ctrler.systemRepository.UpdateRole(role)
	// if updateErr != nil {
	// 	ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
	// 	return
	// }
	ctx.JSON(httpresp.Success200(nil, "Role has been created successfully."))
}
func (ctrler *SystemController) GetRoles(ctx *gin.Context) {
	roles := ctrler.systemRepository.GetRoles()
	ctx.JSON(httpresp.Success200(gin.H{
		"roles": roles,
	}, "User roles fetched."))
}
func (ctrler *SystemController) AssignRole(ctx *gin.Context) {
	accountRoles := model.AccountRoles{}
	bindingErr := ctx.ShouldBindBodyWith(&accountRoles, binding.JSON)
	if bindingErr != nil {
		logger.Error(bindingErr.Error(), slimlog.Function("SystemController.AssignRole"), slimlog.Error("bindingErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid json body."))
		return
	}
	assignErr := ctrler.systemRepository.AssignRole(accountRoles)
	if assignErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Roles assigned successfully."))
}
func (ctrler *SystemController) VerifyAccount(ctx *gin.Context) {
	account := model.Account{}
	bindingErr := ctx.ShouldBindBodyWith(&account, binding.JSON)
	if bindingErr != nil {
		logger.Error(bindingErr.Error(), slimlog.Function("SystemController.VerifyAccount"), slimlog.Error("bindingErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid json body."))
		return
	}
	fmt.Println(account)
	verifyErr := ctrler.accountRepository.VerifyAndUpdateAccount(account)
	if verifyErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	acccount := ctrler.accountRepository.GetAccountById(account.Id)
	ctx.JSON(httpresp.Success200(gin.H{
		"account":acccount,
	}, "Account verified.",))

}
func (ctrler *SystemController) GetAccountRoleAndPermissions(ctx *gin.Context) {
	//get requestorId, the account id of a user. this is a claim from token passed by middleware.ValidateToken
	requestorId, _ := ctx.Get("requestorId")
	_, isAccountIdString := requestorId.(string)
	if !isAccountIdString {
		logger.Error("Invalid account id not string.", slimlog.Function("SystemController.GetAccountRoleAndPermissions"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	requestorApp, _ := ctx.Get("requestorApp")
	app , isAppString := requestorApp.(string)
	if !isAppString {
		logger.Error("Invalid requestor app value.", slimlog.Function("SystemController.GetAccountRoleAndPermissions"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}


	/*
		The requestorRole was set and passed from middlewares.ValidateToken. It is acquired from access token claim named role.
		This role was assigned from Azure Active Directory not from this app.
		The application assigned role will be ignored, if the user role is Root.
		Azure Active Directory role value can be 'Root' or 'User' 
	*/

	
	if app == azuread.AdminAppClientId {
		requestorRole, hasRole := ctx.Get("requestorRole")
		role, isString := requestorRole.(string)
		if !hasRole {
		 		logger.Error("Accout has no role.", slimlog.Function("SystemController.GetAccountRoleAndPermissions"))
				ctx.AbortWithStatus(http.StatusUnauthorized)
				return
		}
		if (!isString){
				logger.Error("Account role is not string.", slimlog.Function("SystemController.GetAccountRoleAndPermissions"))
				ctx.AbortWithStatus(http.StatusUnauthorized)
				return
		}

		if role == "Root" {
			permissions := acl.BuildRootPermissions()
			encryptedPermissions, ecryptionErr := crypt.Encrypt(fmt.Sprintf("%s %s", permissions, requestorId)) 
			if ecryptionErr != nil {
				logger.Error("Permissions failed to encrypt", slimlog.Function("SystemController.GetAccountRoleAndPermissions"))
				ctx.AbortWithStatus(http.StatusUnauthorized)
				return
			}
			const OneDay = 3600 * 24
			ctx.SetCookie("role", encryptedPermissions,OneDay, "/", "", false, true)

			 ctx.JSON(httpresp.Success200(gin.H{
				"permissions": permissions,
			}, "Permissions successfully fetched"))
			return
		}
	}
//    // check if which app request comes from using app id from token.
// 	accountRole := model.Role{}
// 	if app == azuread.ClientAppClientId{
// 		accountRole = model.Role{
// 			Id: 0,
// 			Name: "Libary Client",
// 			Permissions: acl.BuiltInRoles.Client,
// 		}
// 		acl.StorePermissions(accountId, app, acl.BuiltInRoles.Client)
// 		ctx.JSON(httpresp.Success200(gin.H{
// 			"role": accountRole  ,
// 		}, "Role has been fetched successfully."))
// 		return 
// 	}

// 	if app != azuread.AdminAppClientId{
// 		logger.Error("Cannot recognize requestor application.", slimlog.Function("SystemController.GetAccountRoleAndPermissions"))
// 		ctx.AbortWithStatus(http.StatusUnauthorized)
// 		return 
// 	}


// 	/*
// 		The requestorRole was set and passed from middlewares.ValidateToken. It is acquired from access token claim named role.
// 		This role was assigned from Azure Active Directory not from this app.
// 		The application assigned role will be ignored, if the user has assigned role from Azure Active Directory.
// 		Azure Active Directory role value can be 'Root' or 'ReadOnly.All' 
// 	*/

// 	/*
// 		If user has role, The role's permissions will be stored in memory and will be access by 
// 		middlewares.ValidatePermission for validating if certain user has access to a certain 
// 		API endpoint.

// 	*/
// 	requestorRole, hasRole := ctx.Get("requestorRole")
// 	if hasRole {
// 		role, isString := requestorRole.(string)
// 		if isString {
// 			if role == acl.Root {
// 				accountRole = model.Role{
// 					Id:          0,
// 					Name:        role,
// 					Permissions: acl.BuiltInRoles.Root,
// 				}
// 				acl.StorePermissions(accountId, app, acl.BuiltInRoles.Root)
// 				ctx.JSON(httpresp.Success200(gin.H{
// 					"role": accountRole,	
// 				}, "Role has been fetched successfully."))
// 				return
// 			}
// 			if role == acl.MIS {
// 				accountRole = model.Role{
// 					Id:          0,
// 					Name:        role,
// 					Permissions: acl.BuiltInRoles.MIS,
// 				}
// 				acl.StorePermissions(accountId, app, acl.BuiltInRoles.MIS)
// 				ctx.JSON(httpresp.Success200(gin.H{
// 					"role": accountRole,
// 				}, "Role has been fetched successfully."))
// 				return
// 			}
// 		}
// 	}
// 	//if no assigned role from Azure Active Directory, Check the application assigned roles from database.
// 	role, getRoleErr := ctrler.accountRepository.GetRoleByAccountId(accountId)
// 	if getRoleErr != nil {
// 		ctx.JSON(httpresp.Fail500(
// 			nil, "Unknown error occured."))
// 		return
// 	}
// 	// if no permission was assisgned to a user. don't give access to app.
// 	if len(role.Permissions) == 0 {
// 		logger.Error("User has no role and permissions to access the app.", slimlog.Function("SystemController.GetAccountRoleAndPermissions"))
// 		ctx.AbortWithStatus(http.StatusUnauthorized)
// 		return 
// 	}
// 	acl.StorePermissions(accountId,app,role.Permissions)
	// ctx.JSON(httpresp.Success200(gin.H{
	// 	"role": role,
	// }, "Role has been fetched successfully."))
}
func(ctrler * SystemController)GetAccountRoles(ctx * gin.Context){
	accounts := ctrler.accountRepository.GetAccountsWithAssignedRoles()
	ctx.JSON(httpresp.Success200(gin.H{
		"accounts": accounts, 
	}, "Accounts with assigned role fetched."))
}

func (ctrler * SystemController) RemoveRoleAssignment(ctx * gin.Context){
	roleId, convertErr := strconv.Atoi(ctx.Param("id"))

	if convertErr != nil{
		logger.Error(convertErr.Error(), slimlog.Function("SystemController.RemoveRoleAssignment"), slimlog.Error("covertErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid role id."))
		return
	}
	accountId, parseUUIDErr := uuid.Parse(ctx.Param("accountId"))
	if parseUUIDErr != nil {
		logger.Error(convertErr.Error(), slimlog.Function("SystemController.RemoveRoleAssignment"), slimlog.Error("parseUUIDErr"))
	}
	ctrler.systemRepository.RemoveRoleAssignment(roleId, accountId.String())
	ctx.JSON(httpresp.Success200(nil, "Role assignment has been removed."))
}
func (ctrler * SystemController) GetAppSettings(ctx * gin.Context){

	settings :=ctrler.settingsRepository.Get()
	
	ctx.JSON(httpresp.Success200(gin.H{"settings": settings}, "App settings fetched."))
}
func NewSystemConctroller() SystemControllerInterface {
	return &SystemController{
		accountRepository: repository.NewAccountRepository(),
		systemRepository: repository.NewSystemRepository(),
		settingsRepository: repository.NewSettingsRepository(),
	}
}

type SystemControllerInterface interface {
	GetModules(ctx *gin.Context)
	CreateRole(ctx *gin.Context)
	GetRoles(ctx *gin.Context)
	UpdateRole(ctx *gin.Context)
	AssignRole(ctx *gin.Context)
	GetAccountRoleAndPermissions(ctx * gin.Context)
	VerifyAccount(ctx * gin.Context)
	GetAccountRoles(ctx * gin.Context)
	RemoveRoleAssignment(ctx * gin.Context)
	GetAppSettings(ctx * gin.Context)
}
