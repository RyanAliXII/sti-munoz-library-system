package ddc

import (
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

	"github.com/gin-gonic/gin"
)

type DDCController struct {
	ddcRepository repository.DDCRepositoryInterface
	recordMetadataRepository  repository.RecordMetadataRepository
}

func (ctrler *DDCController) GetDDC(ctx *gin.Context) {
	filter := filter.Filter{
		Limit: 10,
	}
	filter.ExtractFilter(ctx)
	var ddc []model.DDC;
	var metadata repository.Metadata
	var metaErr error;
	if len(filter.Keyword) > 0 {
		ddc = ctrler.ddcRepository.Search(&filter)
		metadata, metaErr = ctrler.recordMetadataRepository.GetDDCSearchMetadata(&filter)	
	}else{
		ddc = ctrler.ddcRepository.Get(&filter)
		metadata, metaErr = ctrler.recordMetadataRepository.GetDDCMetadata(filter.Limit)
	}
	
	if metaErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unkown error occured."))
        return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"ddc": ddc,
		"metadata": metadata,
	}, "DDC fetched."))
}
func NewDDCController() DDCControllerInterface {
	return &DDCController{
		ddcRepository: repository.NewDDCRepository(),
		recordMetadataRepository: repository.NewRecordMetadataRepository(repository.RecordMetadataConfig{
			CacheExpiration: time.Duration(time.Minute * 10),
	   }),
	}

}
type DDCControllerInterface interface {
	GetDDC(ctx *gin.Context)
}
