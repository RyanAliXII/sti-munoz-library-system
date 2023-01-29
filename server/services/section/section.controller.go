package section

import (
	"net/http"
	"slim-app/server/app/http/httpresp"
	"slim-app/server/model"
	"slim-app/server/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type SectionController struct {
	repos *repository.Repositories
}

func (ctrler *SectionController) NewCategory(ctx *gin.Context) {
	var body SectionBody
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	ctrler.repos.SectionRepository.New(model.Section{
		Name:            body.Name,
		HasOwnAccession: body.HasOwnAccession,
	})

	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{}, "model.Section created."))
}
func (ctrler *SectionController) GetCategories(ctx *gin.Context) {
	var sections = ctrler.repos.SectionRepository.Get()
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{"sections": sections}, "Sections fetched."))
}

type SectionControllerInterface interface {
	NewCategory(ctx *gin.Context)
	GetCategories(ctx *gin.Context)
}
