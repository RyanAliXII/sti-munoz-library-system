package system

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/acl"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/permissionstore"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type System struct {
	services * services.Services
	permissionStore permissionstore.PermissionStore
}

func (ctrler *System) GetModules(ctx *gin.Context) {

	ctx.JSON(httpresp.Success200(gin.H{
		"permissions": acl.Permissions,
	}, "Permissions fetched."))
}
func (ctrler *System) CreateRole(ctx *gin.Context) {
	role := model.Role{}
	
	bindingErr := ctx.ShouldBindBodyWith(&role, binding.JSON)
	if bindingErr != nil {
		logger.Error(bindingErr.Error(), slimlog.Function("SystemController.CreateRole"), slimlog.Error("bindingErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid json body."))
		return
	}
	insertErr := ctrler.services.Repos.SystemRepository.NewRole(role)
	if insertErr != nil {
		logger.Error(insertErr.Error())
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Role has been created successfully."))
}
func (ctrler *System) UpdateRole(ctx *gin.Context) {
	role := model.Role{}
	bindingErr := ctx.ShouldBindBodyWith(&role, binding.JSON)
	id, parseIdErr := strconv.Atoi(ctx.Param("id"))
	if parseIdErr != nil {
		logger.Error("Invalid param id.", slimlog.Function("SystemController.UpdateRole"), slimlog.Error("parseIdErr"))
		return
	}
	if bindingErr != nil {
		logger.Error(bindingErr.Error(), slimlog.Function("SystemController.UpdateRole"), slimlog.Error("bindingErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid json body."))
		return
	}
	role.Id = id
	updateErr := ctrler.services.Repos.SystemRepository.UpdateRole(role)
	if updateErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctrler.permissionStore.Invalidate()
	ctx.JSON(httpresp.Success200(nil, "Role has been created successfully."))
}
func (ctrler *System) GetRoles(ctx *gin.Context) {
	roles := ctrler.services.Repos.SystemRepository.GetRoles()
	ctx.JSON(httpresp.Success200(gin.H{
		"roles": roles,
	}, "User roles fetched."))
}
func (ctrler *System) AssignRole(ctx *gin.Context) {
	accountRoles := model.AccountRoles{}
	bindingErr := ctx.ShouldBindBodyWith(&accountRoles, binding.JSON)
	if bindingErr != nil {
		logger.Error(bindingErr.Error(), slimlog.Function("SystemController.AssignRole"), slimlog.Error("bindingErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid json body."))
		return
	}
	assignErr := ctrler.services.Repos.SystemRepository.AssignRole(accountRoles)
	if assignErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctrler.permissionStore.Invalidate()
	ctx.JSON(httpresp.Success200(nil, "Roles assigned successfully."))
}
func (ctrler *System) VerifyAccount(ctx *gin.Context) {
	account := model.Account{}
	bindingErr := ctx.ShouldBindBodyWith(&account, binding.JSON)
	if bindingErr != nil {
		logger.Error(bindingErr.Error(), slimlog.Function("SystemController.VerifyAccount"), slimlog.Error("bindingErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid json body."))
		return
	}
	verifyErr := ctrler.services.Repos.AccountRepository.VerifyAndUpdateAccount(account)
	if verifyErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	acccount, err  := ctrler.services.Repos.AccountRepository.GetAccountByIdDontIgnoreIfDeletedOrInactive(account.Id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetAccountByIdDontIgnoreIfDeletedOrInactiveErr"))
		if(err == sql.ErrNoRows){
			ctx.JSON(httpresp.Fail404(nil, "Account not found"))
			return
		}
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}

	if (!acccount.IsActive || acccount.IsDeleted ) &&  azuread.ClientAppClientId == ctx.GetString("requestorApp") {
		ctx.JSON(httpresp.Fail403(nil, "Account has been disabled. Please contact your library administrator."))
		return 
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"account":acccount,
	}, "Account verified.",))

}
func (ctrler *System) GetAccountRoleAndPermissions(ctx *gin.Context) {
	//get requestorId, the account id of a user. this is a claim from token passed by middleware.ValidateToken
	requestorId, _ := ctx.Get("requestorId")
	accountId, isAccountIdString := requestorId.(string)
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
		The requestorRole is also set and passed from middlewares.ValidateToken. It is acquired from access token claim named role.
		This role was assigned from Azure Active Directory not from this app. If the role value is Root, it means that the user has a root access to all system module.
	*/
	if app == azuread.AdminAppClientId {
		requestorRole, hasRole := ctx.Get("requestorRole")
		role, isString := requestorRole.(string)
		if hasRole { 		
			if (!isString){
					logger.Error("Account role is not string.", slimlog.Function("SystemController.GetAccountRoleAndPermissions"))
					ctx.AbortWithStatus(http.StatusUnauthorized)
					return
			}
			// The role 'Root' is assigned from azure ad.
			if role == "Root" {
				permissions := acl.GetRootUserPermissions()
				ctx.JSON(httpresp.Success200(gin.H{
					"permissions": permissions,
				}, "Permissions successfully fetched"))
				return
		  }}
		  r, getPermissionErr := ctrler.services.Repos.AccountRepository.GetRoleByAccountId(accountId)
		  if getPermissionErr != nil {
			logger.Error(getPermissionErr.Error(), slimlog.Function("SystemController.GetAccountRoleAndPermissions"))
			ctx.AbortWithStatus(http.StatusUnauthorized)
		  }
		  ctx.JSON(httpresp.Success200(gin.H{
			"permissions": r.Permissions	 ,
		}, "Permissions successfully fetched"))
		return
	}
}
func(ctrler * System)GetAccountRoles(ctx * gin.Context){
	accounts := ctrler.services.Repos.SystemRepository.GetAccountsWithAssignedRoles()
	ctx.JSON(httpresp.Success200(gin.H{
		"accounts": accounts, 
	}, "Accounts with assigned role fetched."))
}

func (ctrler * System) RemoveRoleAssignment(ctx * gin.Context){
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
	ctrler.services.Repos.SystemRepository.RemoveRoleAssignment(roleId, accountId.String())
	ctx.JSON(httpresp.Success200(nil, "Role assignment has been removed."))
}

func NewSystemConctroller(services * services.Services) SystemController {
	return &System{
		services: services,
		permissionStore: services.PermissionStore,
	}
}

type SystemController interface {
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
	UpdateAppSettings(ctx * gin.Context)
}
