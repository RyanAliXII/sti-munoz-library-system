package publisher

import (
	"slim-app/server/app/http/httpresp"
	"slim-app/server/model"
	"slim-app/server/repository"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"go.uber.org/zap"
)

type PublisherController struct {
	repos *repository.Repositories
}

func (ctrler *PublisherController) NewPublisher(ctx *gin.Context) {
	var publisher model.Publisher
	ctx.ShouldBindBodyWith(&publisher, binding.JSON)
	insertErr := ctrler.repos.PublisherRepository.New(publisher)
	if insertErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, insertErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "model.Publisher added."))
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
	var publisher model.Publisher
	ctx.ShouldBindBodyWith(&publisher, binding.JSON)
	updateErr := ctrler.repos.PublisherRepository.Update(id, publisher)
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
	ctx.JSON(httpresp.Success200(gin.H{}, "model.Publisher deleted."))
}

type PublisherControllerInterface interface {
	NewPublisher(ctx *gin.Context)
	GetPublishers(ctx *gin.Context)
	UpdatePublisher(ctx *gin.Context)
	DeletePublisher(ctx *gin.Context)
}
