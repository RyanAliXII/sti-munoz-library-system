package system

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/acl"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"go.uber.org/zap"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/permissionstore"
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
		ctrler.services.Logger.Error(bindingErr.Error(), applog.Function("SystemController.CreateRole"), applog.Error("bindingErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid json body."))
		return
	}
	insertErr := ctrler.services.Repos.SystemRepository.NewRole(role)
	if insertErr != nil {
		ctrler.services.Logger.Error(insertErr.Error())
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
		ctrler.services.Logger.Error("Invalid param id.", applog.Function("SystemController.UpdateRole"), applog.Error("parseIdErr"))
		return
	}
	if bindingErr != nil {
		ctrler.services.Logger.Error(bindingErr.Error(), applog.Function("SystemController.UpdateRole"), applog.Error("bindingErr"))
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
		ctrler.services.Logger.Error(bindingErr.Error(), applog.Function("SystemController.AssignRole"), applog.Error("bindingErr"))
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
		ctrler.services.Logger.Error(bindingErr.Error(), applog.Function("SystemController.VerifyAccount"), applog.Error("bindingErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid json body."))
		return
	}
	verifyErr := ctrler.services.Repos.AccountRepository.VerifyAndUpdateAccount(account)
	if verifyErr != nil {
		ctrler.services.Logger.Error("Failed to verify and update account." , applog.Function("SystemController.VerifyAccount"), zap.String("accountId", account.Id))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	acccount, err  := ctrler.services.Repos.AccountRepository.GetAccountByIdDontIgnoreIfDeletedOrInactive(account.Id)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("GetAccountByIdDontIgnoreIfDeletedOrInactiveErr"))
		if(err == sql.ErrNoRows){
			ctrler.services.Logger.Error("Account cannot be found." , applog.Function("SystemController.VerifyAccount"), zap.String("accountId", account.Id))
			ctx.JSON(httpresp.Fail404(nil, "Account not found"))
			return
		}

		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}

	if (!acccount.IsActive || acccount.IsDeleted ) &&  ctrler.services.Config.ClientAppClientID== ctx.GetString("requestorApp") {
		ctrler.services.Logger.Error("Account has been disabled.." , applog.Function("SystemController.VerifyAccount"), zap.String("accountId", account.Id))
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
		ctrler.services.Logger.Error("Invalid account id not string.", applog.Function("SystemController.GetAccountRoleAndPermissions"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	requestorApp, _ := ctx.Get("requestorApp")
	app , isAppString := requestorApp.(string)
	if !isAppString {
		ctrler.services.Logger.Error("Invalid requestor app value.", applog.Function("SystemController.GetAccountRoleAndPermissions"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	/*
		The requestorRole is also set and passed from middlewares.ValidateToken. It is acquired from access token claim named role.
		This role was assigned from Azure Active Directory not from this app. If the role value is Root, it means that the user has a root access to all system module.
	*/
	if app == ctrler.services.Config.AdminAppClientID {
		requestorRole, hasRole := ctx.Get("requestorRole")
		role, isString := requestorRole.(string)
		if hasRole { 		
			if (!isString){
					ctrler.services.Logger.Error("Account role is not string.", applog.Function("SystemController.GetAccountRoleAndPermissions"))
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
			ctrler.services.Logger.Error(getPermissionErr.Error(), applog.Function("SystemController.GetAccountRoleAndPermissions"))
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
		ctrler.services.Logger.Error(convertErr.Error(), applog.Function("SystemController.RemoveRoleAssignment"), applog.Error("covertErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid role id."))
		return
	}
	accountId, parseUUIDErr := uuid.Parse(ctx.Param("accountId"))
	if parseUUIDErr != nil {
		ctrler.services.Logger.Error(parseUUIDErr.Error(), applog.Function("SystemController.RemoveRoleAssignment"), applog.Error("parseUUIDErr"))
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
