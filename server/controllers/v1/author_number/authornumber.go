package authornum

import (
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

	"github.com/gin-gonic/gin"
)

type AuthorNumberController struct {
	authorNumberRepository repository.AuthorNumberRepositoryInterface
	recordMetadata repository.RecordMetadataRepository
}


func (ctrler *AuthorNumberController) GetAuthorNumbers(ctx *gin.Context) {

	filter := filter.ExtractFilter(ctx)
	if len(filter.Keyword) > 0 {
		cutters := ctrler.authorNumberRepository.Search(filter)
		metadata, err := ctrler.recordMetadata.GetAuthorNumberSearchMetadata(filter)
		if err != nil {
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
			return 
		}
		ctx.JSON(httpresp.Success200(gin.H{"cutters": cutters, "metadata": metadata}, "Author numbers fetched."))	
		return 
	}
	cutters := ctrler.authorNumberRepository.Get(filter)
	metadata, err := ctrler.recordMetadata.GetAuthorNumberMetadata(filter.Limit)
	if err != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(gin.H{"cutters": cutters, "metadata": metadata}, "Author numbers fetched."))
}
func (ctrler *AuthorNumberController) GetAuthorNumbersByInitial(ctx *gin.Context) {}
func NewAuthorNumberController() AuthorNumberControllerInterface {
	return &AuthorNumberController{
		authorNumberRepository: repository.NewAuthorNumberRepository(),
		recordMetadata: repository.NewRecordMetadataRepository(repository.RecordMetadataConfig{
			CacheExpiration: time.Minute * 5,
		}),
	}

}

type AuthorNumberControllerInterface interface {

	GetAuthorNumbers(ctx *gin.Context)
	
}
