package fundsrc

// sof = SOURCE OF FUND

import (
	"net/http"
	"slim-app/server/app/http/httpresp"
	"slim-app/server/model"
	"slim-app/server/repository"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"go.uber.org/zap"
)

type FundSourceController struct {
	repos *repository.Repositories
}

func (ctrler *FundSourceController) NewSource(ctx *gin.Context) {
	var fundSource model.FundSource
	ctx.ShouldBindBodyWith(&fundSource, binding.JSON)
	insertErr := ctrler.repos.SOFRepository.New(fundSource)
	if insertErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, insertErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{}, "Source added."))
}
func (ctrler *FundSourceController) GetSources(ctx *gin.Context) {
	var sources []model.FundSource = ctrler.repos.SOFRepository.Get()
	ctx.JSON(httpresp.Success200(gin.H{"sources": sources}, "Sources fetched."))
}
func (ctrler *FundSourceController) DeleteSource(ctx *gin.Context) {
	id, castErr := strconv.Atoi(ctx.Param("id"))
	if castErr != nil {
		logger.Warn(castErr.Error(), zap.String("error", "castErr"))
		ctx.JSON(httpresp.Fail400(gin.H{}, castErr.Error()))
		return
	}
	deleteErr := ctrler.repos.SOFRepository.Delete(id)
	if deleteErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, deleteErr.Error()))
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
	updateErr := ctrler.repos.SOFRepository.Update(id, model.FundSource{Name: body.Name})
	if updateErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, updateErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{}, "Sources updated."))
}
func NewFundSourceController(repos *repository.Repositories) FundSourceControllerInterface {
	return &FundSourceController{
		repos: repos,
	}

}

type FundSourceControllerInterface interface {
	NewSource(ctx *gin.Context)
	GetSources(ctx *gin.Context)
	DeleteSource(ctx *gin.Context)
	UpdateSource(ctx *gin.Context)
}
