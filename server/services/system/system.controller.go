package system

import (
	"slim-app/server/app/http/httpresp"
	acl "slim-app/server/app/pkg/acl"
	"slim-app/server/app/pkg/slimlog"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type SystemController struct {
}

func (ctrler *SystemController) GetModules(ctx *gin.Context) {

	ctx.JSON(httpresp.Success200(gin.H{
		"modules": acl.Modules,
	}, "Permissions fetched."))
}
func (ctrler *SystemController) CreateRole(ctx *gin.Context) {
	body := RoleBody{}
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	validateErr := acl.Validate(body.Permissions)
	if validateErr != nil {
		logger.Error(validateErr.Error(), slimlog.Function("SystemController.CreateRole"))
		ctx.JSON(httpresp.Fail400(nil, "Permissions doesn't not exists on this app."))
		return
	}
}
func NewSystemConctroller() SystemControllerInterface {
	return &SystemController{}
}

type SystemControllerInterface interface {
	GetModules(ctx *gin.Context)
	CreateRole(ctx *gin.Context)
}
