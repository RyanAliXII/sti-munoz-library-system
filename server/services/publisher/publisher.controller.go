package publisher

import (
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"go.uber.org/zap"
)

type PublisherController struct {
	publisherRepository repository.PublisherRepositoryInterface
}

func (ctrler *PublisherController) NewPublisher(ctx *gin.Context) {
	var publisher model.Publisher
	ctx.ShouldBindBodyWith(&publisher, binding.JSON)
	insertErr := ctrler.publisherRepository.New(publisher)
	if insertErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, insertErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "model.Publisher added."))
}
func (ctrler *PublisherController) GetPublishers(ctx *gin.Context) {
	var publishers []model.Publisher = ctrler.publisherRepository.Get()
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
	updateErr := ctrler.publisherRepository.Update(id, publisher)
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
	deleteErr := ctrler.publisherRepository.Delete(id)
	if deleteErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, deleteErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "model.Publisher deleted."))
}
func NewPublisherController() PublisherControllerInterface {
	return &PublisherController{
		publisherRepository: repository.NewPublisherRepository(),
	}

}

type PublisherControllerInterface interface {
	NewPublisher(ctx *gin.Context)
	GetPublishers(ctx *gin.Context)
	UpdatePublisher(ctx *gin.Context)
	DeletePublisher(ctx *gin.Context)
}
