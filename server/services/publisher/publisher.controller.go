package publisher

import (
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type PublisherController struct {
	publisherRepository repository.PublisherRepositoryInterface
	recordMetadataRepository  repository.RecordMetadataRepository
}

func (ctrler *PublisherController) NewPublisher(ctx *gin.Context) {
	var publisher model.Publisher
	ctx.ShouldBindBodyWith(&publisher, binding.JSON)
	publisher,insertErr := ctrler.publisherRepository.New(publisher)
	if insertErr != nil {
		ctx.JSON(httpresp.Fail400(nil, insertErr.Error()))
		return
	}
	ctrler.recordMetadataRepository.InvalidatePublisher()
	ctx.JSON(httpresp.Success200(gin.H{
		"publisher": publisher,
	}, "Publisher added."))
}
func (ctrler *PublisherController) GetPublishers(ctx *gin.Context) {
	filter := filter.ExtractFilter(ctx)
	if(len(filter.Keyword) > 0){
		publishers := ctrler.publisherRepository.Search(&filter)
		metaData, metaErr := ctrler.recordMetadataRepository.GetAccountSearchMetadata(&filter)
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
	var publishers []model.Publisher = ctrler.publisherRepository.Get(&filter)
	metaData, metaErr := ctrler.recordMetadataRepository.GetPublisherMetadata(filter.Limit)
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
func (ctrler *PublisherController) UpdatePublisher(ctx *gin.Context) {
	id := ctx.Param("id")
	
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
	id := ctx.Param("id")
	deleteErr := ctrler.publisherRepository.Delete(id)
	if deleteErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, deleteErr.Error()))
		return
	}
	ctrler.recordMetadataRepository.InvalidatePublisher()
	ctx.JSON(httpresp.Success200(gin.H{}, "model.Publisher deleted."))
}
func NewPublisherController() PublisherControllerInterface {
	return &PublisherController{
		publisherRepository: repository.NewPublisherRepository(),
		recordMetadataRepository: repository.NewRecordMetadataRepository(repository.RecordMetadataConfig{
			CacheExpiration: time.Minute * 5,
	   }),
	}

}

type PublisherControllerInterface interface {
	NewPublisher(ctx *gin.Context)
	GetPublishers(ctx *gin.Context)
	UpdatePublisher(ctx *gin.Context)
	DeletePublisher(ctx *gin.Context)
}
