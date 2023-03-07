package fundsrc

// sof = SOURCE OF FUND

import (
	"net/http"
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"go.uber.org/zap"
)

type FundSourceController struct {
	fundSourceRepository repository.FundSourceRepositoryInterface
}

func (ctrler *FundSourceController) NewSource(ctx *gin.Context) {
	var fundSource model.FundSource
	ctx.ShouldBindBodyWith(&fundSource, binding.JSON)
	insertErr := ctrler.fundSourceRepository.New(fundSource)
	if insertErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, insertErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{}, "Source added."))
}
func (ctrler *FundSourceController) GetSources(ctx *gin.Context) {
	var sources []model.FundSource = ctrler.fundSourceRepository.Get()
	ctx.JSON(httpresp.Success200(gin.H{"sources": sources}, "Sources fetched."))
}
func (ctrler *FundSourceController) DeleteSource(ctx *gin.Context) {
	id, castErr := strconv.Atoi(ctx.Param("id"))
	if castErr != nil {
		logger.Warn(castErr.Error(), zap.String("error", "castErr"))
		ctx.JSON(httpresp.Fail400(nil, castErr.Error()))
		return
	}
	deleteErr := ctrler.fundSourceRepository.Delete(id)
	if deleteErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}

	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{}, "Source deleted."))
}
func (ctrler *FundSourceController) UpdateSource(ctx *gin.Context) {
	id, castErr := strconv.Atoi(ctx.Param("id"))
	if castErr != nil {
		logger.Warn(castErr.Error(), zap.String("error", "castErr"))
		ctx.JSON(httpresp.Fail400(gin.H{}, castErr.Error()))
		return
	}
	var body SourceBody
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	updateErr := ctrler.fundSourceRepository.Update(id, model.FundSource{Name: body.Name})
	if updateErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{}, "Sources updated."))
}
func NewFundSourceController() FundSourceControllerInterface {
	return &FundSourceController{
		fundSourceRepository: repository.NewFundSourceRepository(),
	}

}

type FundSourceControllerInterface interface {
	NewSource(ctx *gin.Context)
	GetSources(ctx *gin.Context)
	DeleteSource(ctx *gin.Context)
	UpdateSource(ctx *gin.Context)
}
