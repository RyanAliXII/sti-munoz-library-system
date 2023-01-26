package publisher

import (
	"slim-app/server/app/http/httpresp"
	"slim-app/server/app/model"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/app/repository"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"go.uber.org/zap"
)

type PublisherController struct {
	repos *repository.Repositories
}

var logger *zap.Logger = slimlog.GetInstance()

func (ctrler *PublisherController) NewPublisher(ctx *gin.Context) {
	var publisher PublisherBody
	ctx.ShouldBindBodyWith(&publisher, binding.JSON)
	insertErr := ctrler.repos.PublisherRepository.New(model.Publisher{Name: publisher.Name})
	if insertErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, insertErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "Publisher added."))
}
func (ctrler *PublisherController) GetPublishers(ctx *gin.Context) {
	var publishers []model.Publisher = ctrler.repos.PublisherRepository.Get()
	ctx.JSON(httpresp.Success200(gin.H{
		"publishers": publishers,
	}, "Publishers successfully fetched."))
}
func (ctrler *PublisherController) UpdatePublisher(ctx *gin.Context) {
	id, castErr := strconv.Atoi(ctx.Param("id"))
	if castErr != nil {
		logger.Warn(castErr.Error(), zap.String("error", "castErr"))
		ctx.JSON(httpresp.Fail400(gin.H{}, castErr.Error()))
		return
	}
	var publisher PublisherBody
	ctx.ShouldBindBodyWith(&publisher, binding.JSON)
	updateErr := ctrler.repos.PublisherRepository.Update(id, model.Publisher{Name: publisher.Name})
	if updateErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, updateErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "Publishers successfully updated."))

}
func (ctrler *PublisherController) DeletePublisher(ctx *gin.Context) {
	id, castErr := strconv.Atoi(ctx.Param("id"))
	if castErr != nil {
		logger.Warn(castErr.Error(), zap.String("error", "castErr"))
		ctx.JSON(httpresp.Fail400(gin.H{}, castErr.Error()))
		return
	}
	deleteErr := ctrler.repos.PublisherRepository.Delete(id)
	if deleteErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, deleteErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "Publisher deleted."))
}

type PublisherControllerInterface interface {
	NewPublisher(ctx *gin.Context)
	GetPublishers(ctx *gin.Context)
	UpdatePublisher(ctx *gin.Context)
	DeletePublisher(ctx *gin.Context)
}
