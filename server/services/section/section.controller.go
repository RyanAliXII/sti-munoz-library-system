package section

import (
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type SectionController struct {
	sectionRepository repository.SectionRepositoryInterface
}

func (ctrler *SectionController) NewCategory(ctx *gin.Context) {
	var body SectionBody
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	ctrler.sectionRepository.New(model.Section{
		Name:            body.Name,
		HasOwnAccession: body.HasOwnAccession,
	})

	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{}, "model.Section created."))
}
func (ctrler *SectionController) GetCategories(ctx *gin.Context) {
	var sections = ctrler.sectionRepository.Get()
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{"sections": sections}, "Sections fetched."))
}
func NewSectionController() SectionControllerInterface {
	return &SectionController{
		sectionRepository: repository.NewSectionRepository(),
	}

}

type SectionControllerInterface interface {
	NewCategory(ctx *gin.Context)
	GetCategories(ctx *gin.Context)
}
