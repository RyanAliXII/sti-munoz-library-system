package penalty

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gin-gonic/gin"
)

func (ctrler * PenaltyController)NewClassfication(ctx * gin.Context){
	class := model.PenaltyClassification{}
	err := ctx.Bind(&class)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("binderr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured"))
		return
	}
	fieldErrs, err := class.ValidateNew()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("validateErr"))
		ctx.JSON(httpresp.Fail400(gin.H{
			"errors" : fieldErrs,
		}, "Validation error."))
		return
	}
	err = ctrler.penaltyRepo.NewPenaltyClassification(class)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("NewPenaltyClassErr"))
		ctx.JSON(httpresp.Fail500(nil, "NewPenaltyClassErr "))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "New class added."))
}
func (ctrler * PenaltyController)GetPenaltyClasses(ctx * gin.Context){
	classes, err := ctrler.penaltyRepo.GetPenaltyClassifications()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error(err.Error()))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"penaltyClasses" : classes,
	}, "OK"))
}
func (ctrler * PenaltyController)UpdatePenaltyClass(ctx * gin.Context) {
	id := ctx.Param("id")
	class := model.PenaltyClassification{}
	err := ctx.Bind(&class)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("binderr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured"))
		return
	}
	fieldErrs, err := class.ValidateUpdate()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("validateErr"))
		ctx.JSON(httpresp.Fail400(gin.H{
			"errors" : fieldErrs,
		}, "Validation error."))
		return
	}

	class.Id = id
	err = ctrler.penaltyRepo.UpdatePenaltyClassification(class)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("UpdatePenaltyClassErr"))
		ctx.JSON(httpresp.Fail500(nil, "UpdatePenaltyClassErr "))
		return	
	}
	ctx.JSON(httpresp.Success200(nil, "Class updated."))
}
func (ctrler * PenaltyController)DeletePenaltyClass(ctx * gin.Context) {
	id := ctx.Param("id")
	err := ctrler.penaltyRepo.DeletePenaltyClassification(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("deleteErr"))
		ctx.JSON(httpresp.Fail500(nil, "DeletePenaltyClassErr "))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Class deleted."))
}