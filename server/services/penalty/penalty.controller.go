package penalty

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type PenaltyController struct{
	penaltyRepo  repository.PenaltyRepositoryInterface
}

func (ctrler * PenaltyController) GetPenalties (ctx * gin.Context){
	requestorApp, hasRequestorApp := ctx.Get("requestorApp")
	parsedRequestorApp, isRequestorAppStr := requestorApp.(string)

	if!hasRequestorApp || !isRequestorAppStr{
        httpresp.Fail400(nil, "Bad request.")
        return
    }

	if parsedRequestorApp == azuread.AdminAppClientId {
		penalties := ctrler.penaltyRepo.GetPenalties()
		ctx.JSON(httpresp.Success200(gin.H{
				"penalties": penalties,
			}, "penalties has been fetched."))
			return
	}
	ctx.JSON(httpresp.Fail500(nil, "Unknown error occured please try again later."))
}

func (ctrler * PenaltyController)UpdatePenaltySettlement(ctx *gin.Context){
	penaltyId := ctx.Param("id")
	body := SettlePenaltyBody{}
	err := ctx.Bind(&body)
	isUpdate := ctx.Query("isUpdate")

	if isUpdate == "true"{
		err := ctrler.penaltyRepo.UpdateSettlement(penaltyId, body.Proof, body.Remarks)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("UpdateSettlement"))
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
			return 
		}
		ctx.JSON(httpresp.Success200(nil, "Settlement has been updated."))
		return
	}
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("BindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	}
	err = ctrler.penaltyRepo.MarkAsSettled(penaltyId, body.Proof, body.Remarks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAsSettled"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Settlement has been updated."))

}
func (ctrler * PenaltyController)AddPenalty( ctx * gin.Context){
    penalty := model.Penalty{}
	ctx.ShouldBindBodyWith(&penalty, binding.JSON)
	addErr := ctrler.penaltyRepo.AddPenalty(penalty)
	if addErr!= nil {
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured please try again later."))
			return
	}
	ctx.JSON(httpresp.Success200(nil, "Penalty has been added."))
}
func (ctrler * PenaltyController)UpdatePenalty( ctx * gin.Context){
    penalty := model.Penalty{}
	ctx.ShouldBindBodyWith(&penalty, binding.JSON)
	addErr := ctrler.penaltyRepo.UpdatePenalty(penalty)
	if addErr!= nil {
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured please try again later."))
			return
	}
	ctx.JSON(httpresp.Success200(nil, "Penalty has been added."))
}


func NewPenaltyController() PenaltyControllerInterface {

	return &PenaltyController{
			penaltyRepo: repository.NewPenaltyRepository(),
	}

}

type PenaltyControllerInterface interface {
	GetPenalties (ctx * gin.Context)
	UpdatePenaltySettlement(ctx *gin.Context)
	AddPenalty( ctx * gin.Context)
	UpdatePenalty( ctx * gin.Context)
	NewClassfication(ctx * gin.Context) 
	GetPenaltyClasses(ctx * gin.Context)
	UpdatePenaltyClass(ctx * gin.Context)
	DeletePenaltyClass(ctx * gin.Context)
}