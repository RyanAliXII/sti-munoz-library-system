package accessionnumber

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)


type AccessionNumberController interface {
	GetAccessionNumbers(ctx * gin.Context)
	UpdateAccessionNumber(ctx * gin.Context)
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
func(ctrler * AccessionNumber)UpdateAccessionNumber(ctx * gin.Context){
	accession := ctx.Param("accession")
	accessionNumber := model.AccessionNumber{}
	accessionNumber.Accession = accession
	err := ctx.ShouldBindBodyWith(&accessionNumber, binding.JSON)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), slimlog.Error("AccessionNumberController.UpdateAccessionNumber"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	}
	err = ctrler.services.Repos.AccessionNumberRepository.Update(accessionNumber)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), slimlog.Error("AccessionNumberController.UpdateAccessionNumber"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	
	ctx.JSON(httpresp.Success200(gin.H{}, "Accession number updated."))
}