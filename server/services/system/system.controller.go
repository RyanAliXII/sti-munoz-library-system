package system

import (
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	acl "github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/acl"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

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
	role.Permissions = acl.Validate(role.Permissions)
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
	role.Permissions = acl.Validate(role.Permissions)	
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
