package system

import (
	"slim-app/server/app/http/httpresp"
	acl "slim-app/server/app/pkg/security"

	"github.com/gin-gonic/gin"
)

type SystemController struct {
}

func (ctrler *SystemController) GetModules(ctx *gin.Context) {

	ctx.JSON(httpresp.Success200(gin.H{
		"modules": acl.Modules,
	}, "Permissions fetched."))
}

func NewSystemConctroller() SystemControllerInterface {
	return &SystemController{}
}

type SystemControllerInterface interface {
	GetModules(ctx *gin.Context)
}
