package authornumber

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/gin-gonic/gin"
)

type AuthorNumber struct {
	services * services.Services
}

func (ctrler *AuthorNumber) GetAuthorNumbers(ctx *gin.Context) {
	filter := filter.ExtractFilter(ctx)
	if len(filter.Keyword) > 0 {
		cutters := ctrler.services.Repos.AuthorNumberRepository.Search(filter)
		metadata, err := ctrler.services.Repos.RecordMetadataRepository.GetAuthorNumberSearchMetadata(filter)
		if err != nil {
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
			return 
		}
		ctx.JSON(httpresp.Success200(gin.H{"cutters": cutters, "metadata": metadata}, "Author numbers fetched."))	
		return 
	}
	cutters := ctrler.services.Repos.AuthorNumberRepository.Get(filter)
	metadata, err := ctrler.services.Repos.RecordMetadataRepository.GetAuthorNumberMetadata(filter.Limit)
	if err != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(gin.H{"cutters": cutters, "metadata": metadata}, "Author numbers fetched."))
}
func NewAuthorNumberController(services * services.Services) AuthorNumberController{
	return &AuthorNumber{
		services: services,
	}

}

type AuthorNumberController interface {
	GetAuthorNumbers(ctx *gin.Context)
}
