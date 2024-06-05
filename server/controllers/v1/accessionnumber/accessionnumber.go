package accessionnumber

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)


type AccessionNumberController interface {
	GetAccessionNumbers(ctx * gin.Context)
}
type AccessionNumber struct {
	services * services.Services
}
func NewAccessionNumberController (services * services.Services) AccessionNumberController{
	return &AccessionNumber{
		services: services,
	}
}
func(ctrler * AccessionNumber)GetAccessionNumbers(ctx * gin.Context){
	accessionNumbers, err := ctrler.services.Repos.AccessionNumberRepository.Get()
	if err != nil {
		ctrler.services.Logger.Info(err.Error(), slimlog.Error("AccessionNumberController.GetAccessioNumbers"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"accessionNumbers": accessionNumbers,
	}, "Accession numbers fetched."))
}