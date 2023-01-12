package ddc

import (
	"slim-app/server/app/http/httpresp"
	"slim-app/server/app/pkg/dewey"
	"slim-app/server/app/repository"

	"github.com/gin-gonic/gin"
)

type DDCController struct {
	repos *repository.Repositories
}

func (ctler *DDCController) GetDDC(ctx *gin.Context) {

	var ddc []dewey.DeweyDecimal = dewey.LoadFromJSON()
	ctx.JSON(httpresp.Success200(gin.H{
		"ddc": ddc,
	}, "Hello world"))
}

type DDCControllerInterface interface {
	GetDDC(ctx *gin.Context)
}
