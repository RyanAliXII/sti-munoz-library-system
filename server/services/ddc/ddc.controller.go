package ddc

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
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
	ddc := ctrler.ddcRepository.Get(&filter) 
	metadata, metaErr := ctrler.recordMetadataRepository.GetDDCMetadata(filter.Limit)
	if metaErr != nil {
		ctx.JSON(httpresp.Fail500(gin.H{
			"message": "Unknown error occured",
		}, "Invalid page number."))
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
		recordMetadataRepository: repository.NewRecordMetadataRepository(),
	}

}

type DDCControllerInterface interface {
	GetDDC(ctx *gin.Context)
}
