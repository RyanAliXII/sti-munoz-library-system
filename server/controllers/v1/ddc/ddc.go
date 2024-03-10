package ddc

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/gin-gonic/gin"
)

type DDC struct {
	services * services.Services
}

func (ctrler *DDC) GetDDC(ctx *gin.Context) {
	filter := filter.Filter{
		Limit: 10,
	}
	filter.ExtractFilter(ctx)
	var ddc []model.DDC;
	var metadata repository.Metadata
	var metaErr error;
	if len(filter.Keyword) > 0 {
		ddc = ctrler.services.Repos.DDCRepository.Search(&filter)
		metadata, metaErr = ctrler.services.Repos.RecordMetadataRepository.GetDDCSearchMetadata(&filter)	
	}else{
		ddc = ctrler.services.Repos.DDCRepository.Get(&filter)
		metadata, metaErr = ctrler.services.Repos.RecordMetadataRepository.GetDDCMetadata(filter.Limit)
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
func NewDDCController(services * services.Services) DDCController {
	return &DDC{
		services: services,
	}

}
type DDCController interface {
	GetDDC(ctx *gin.Context)
}
