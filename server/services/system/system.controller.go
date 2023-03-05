package system

import (
	"slim-app/server/app/http/httpresp"
	"slim-app/server/app/pkg/security"

	"github.com/gin-gonic/gin"
)

type SystemController struct {
}

func (ctrler *SystemController) GetPermissions(ctx *gin.Context) {

	ctx.JSON(httpresp.Success200(gin.H{
		"permissions": security.Permissions,
	}, "Permissions fetched."))
}

func NewSystemConctroller() SystemControllerInterface {
	return &SystemController{}
}

type SystemControllerInterface interface {
	GetPermissions(ctx *gin.Context)
}
