package ddc

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

	"github.com/gin-gonic/gin"
)

type DDCController struct {
	ddcRepository repository.DDCRepositoryInterface
}

func (ctrler *DDCController) GetDDC(ctx *gin.Context) {
	ddc :=ctrler.ddcRepository.Get(repository.Filter{}) 
	ctx.JSON(httpresp.Success200(gin.H{
		"ddc": ddc,
	}, "DDC fetched."))
}
func NewDDCController() DDCControllerInterface {
	return &DDCController{
		ddcRepository: repository.NewDDCRepository(),
	}

}

type DDCControllerInterface interface {
	GetDDC(ctx *gin.Context)
}
