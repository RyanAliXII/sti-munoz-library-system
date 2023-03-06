package system

import (
	"slim-app/server/app/http/httpresp"
	acl "slim-app/server/app/pkg/acl"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/model"
	"slim-app/server/repository"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type SystemController struct {
	systemRepository repository.SystemRepositoryInterface
}

func (ctrler *SystemController) GetModules(ctx *gin.Context) {

	ctx.JSON(httpresp.Success200(gin.H{
		"modules": acl.Modules,
	}, "Permissions fetched."))
}
func (ctrler *SystemController) CreateRole(ctx *gin.Context) {
	role := model.Role{}
	bindingErr := ctx.ShouldBindBodyWith(&role, binding.JSON)
	if bindingErr != nil {
		logger.Error(bindingErr.Error(), slimlog.Function("SystemController.CreateRole"), slimlog.Error("bindingErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid json body."))
		return
	}
	validateErr := acl.Validate(role.Permissions)
	if validateErr != nil {
		logger.Error(validateErr.Error(), slimlog.Function("SystemController.CreateRole"), slimlog.Error("validateErr"))
		ctx.JSON(httpresp.Fail400(nil, "Permissions doesn't not exists on this app."))
		return
	}

	insertErr := ctrler.systemRepository.NewRole(role)
	if insertErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Role has been created successfully."))
}
func (ctrler *SystemController) UpdateRole(ctx *gin.Context) {
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
	validateErr := acl.Validate(role.Permissions)
	if validateErr != nil {
		logger.Error(validateErr.Error(), slimlog.Function("SystemController.UpdateRole"), slimlog.Error("validateErr"))
		ctx.JSON(httpresp.Fail400(nil, "Permissions doesn't not exists on this app."))
		return
	}
	role.Id = id
	updateErr := ctrler.systemRepository.UpdateRole(role)
	if updateErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
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
func NewSystemConctroller() SystemControllerInterface {
	return &SystemController{
		systemRepository: repository.NewSystemRepository(),
	}
}

type SystemControllerInterface interface {
	GetModules(ctx *gin.Context)
	CreateRole(ctx *gin.Context)
	GetRoles(ctx *gin.Context)
	UpdateRole(ctx *gin.Context)
	AssignRole(ctx *gin.Context)
}
