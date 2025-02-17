package publisher

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type Publisher struct {
	services * services.Services
}

func (ctrler *Publisher) NewPublisher(ctx *gin.Context) {
	var publisher model.Publisher
	ctx.ShouldBindBodyWith(&publisher, binding.JSON)
	fieldErrs, err  := publisher.ValidateNew()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("new publisher validation"))
		ctx.JSON(httpresp.Fail400(gin.H{"errors": fieldErrs}, "Validation error."))
		return
	}
	publisher,insertErr := ctrler.services.Repos.PublisherRepository.New(publisher)
	if insertErr != nil {
		ctx.JSON(httpresp.Fail400(nil, insertErr.Error()))
		return
	}
	ctrler.services.Repos.RecordMetadataRepository.InvalidatePublisher()
	ctx.JSON(httpresp.Success200(gin.H{
		"publisher": publisher,
	}, "Publisher added."))
}
func (ctrler *Publisher) GetPublishers(ctx *gin.Context) {
	filter := filter.ExtractFilter(ctx)
	if(len(filter.Keyword) > 0){
		publishers := ctrler.services.Repos.PublisherRepository.Search(&filter)
		metaData, metaErr := ctrler.services.Repos.RecordMetadataRepository.GetAccountSearchMetadata(&filter)
		if metaErr != nil {
			logger.Error(metaErr.Error(), slimlog.Error("account search metadata"))
			ctx.JSON(httpresp.Fail500(gin.H{
				"message": "Unknown error occured",
			}, "Invalid page number."))
			return
		}
		ctx.JSON(httpresp.Success200(gin.H{
			"publishers": publishers,
			"metaData": metaData,
		}, "Publishers successfully fetched."))
		return
	}
	var publishers []model.Publisher = ctrler.services.Repos.PublisherRepository.Get(&filter)
	metaData, metaErr := ctrler.services.Repos.RecordMetadataRepository.GetPublisherMetadata(filter.Limit)
	if metaErr != nil {
		ctx.JSON(httpresp.Fail500(gin.H{
			"message": "Unknown error occured",
		}, "Invalid page number."))
        return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"publishers": publishers,
		"metaData": metaData,
	}, "Publishers successfully fetched."))
}
func (ctrler *Publisher) UpdatePublisher(ctx *gin.Context) {
	id := ctx.Param("id")
	var publisher model.Publisher
	ctx.ShouldBindBodyWith(&publisher, binding.JSON)
	publisher.Id = id
	fieldErrs, err  := publisher.ValidateUpdate()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("new publisher validation"))
		ctx.JSON(httpresp.Fail400(gin.H{"errors": fieldErrs}, "Validation error."))
		return
	}
	updateErr := ctrler.services.Repos.PublisherRepository.Update(id, publisher)
	if updateErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, updateErr.Error()))
		return
	}
	ctrler.services.Repos.RecordMetadataRepository.InvalidatePublisher()
	ctx.JSON(httpresp.Success200(gin.H{}, "Publishers successfully updated."))

}
func (ctrler *Publisher) DeletePublisher(ctx *gin.Context) {
	id := ctx.Param("id")
	deleteErr := ctrler.services.Repos.PublisherRepository.Delete(id)
	if deleteErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, deleteErr.Error()))
		return
	}
	ctrler.services.Repos.RecordMetadataRepository.InvalidatePublisher()
	ctx.JSON(httpresp.Success200(gin.H{}, "model.Publisher deleted."))
}
func NewPublisherController(services * services.Services) PublisherController {
	return &Publisher{
		services: services,
	}

}

type PublisherController interface {
	NewPublisher(ctx *gin.Context)
	GetPublishers(ctx *gin.Context)
	UpdatePublisher(ctx *gin.Context)
	DeletePublisher(ctx *gin.Context)
}
