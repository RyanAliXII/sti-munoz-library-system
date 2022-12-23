package sofsrc

// sof = SOURCE OF FUND

import (
	"net/http"
	"slim-app/server/app/http/httpresp"
	"slim-app/server/app/model"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/app/repository"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"go.uber.org/zap"
)

type SOFController struct {
	repos *repository.Repositories
}

var logger *zap.Logger = slimlog.GetInstance()

func (ctrler *SOFController) NewSource(ctx *gin.Context) {
	var body SourceBody
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	insertErr := ctrler.repos.SOFRepository.New(model.SOF{Name: body.Name})
	if insertErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, insertErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{}, "Source added."))
}
func (ctrler *SOFController) GetSources(ctx *gin.Context) {
	var sources []model.SOF = ctrler.repos.SOFRepository.Get()
	ctx.JSON(httpresp.Success200(gin.H{"sources": sources}, "Sources fetched."))
}
func (ctrler *SOFController) DeleteSource(ctx *gin.Context) {
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
func (ctrler *SOFController) UpdateSource(ctx *gin.Context) {
	id, castErr := strconv.Atoi(ctx.Param("id"))
	if castErr != nil {
		logger.Warn(castErr.Error(), zap.String("error", "castErr"))
		ctx.JSON(httpresp.Fail400(gin.H{}, castErr.Error()))
		return
	}
	var body SourceBody
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	updateErr := ctrler.repos.SOFRepository.Update(id, model.SOF{Name: body.Name})
	if updateErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, updateErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{}, "Sources updated."))
}

type SOFInterface interface {
	NewSource(ctx *gin.Context)
	GetSources(ctx *gin.Context)
	DeleteSource(ctx *gin.Context)
	UpdateSource(ctx *gin.Context)
}
