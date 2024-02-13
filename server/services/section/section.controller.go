package section

import (
	"net/http"
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type SectionController struct {
	sectionRepository repository.SectionRepositoryInterface
}

func (ctrler *SectionController) NewCategory(ctx *gin.Context) {
	var body model.Section
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	fields, err := body.ValidateSection()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("validation error."))
		ctx.JSON(httpresp.Fail400(gin.H{
			"errors": fields,
		}, "Validation error."))
		return 
	}	
	err = ctrler.sectionRepository.New(body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("New collection error"))
		ctx.JSON(httpresp.Fail500(gin.H{
			"errors": fields,
		}, "Validation error."))
		return
	}
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{}, "model.Section created."))
}
func (ctrler *SectionController)GetCategories(ctx *gin.Context) {
	filter  := CollectionFilter{}
	err := ctx.ShouldBindQuery(&filter)
	if err != nil {
		logger.Error(err.Error())
	}
	tree := ctrler.sectionRepository.GetCollectionTree()
	if filter.IsMain {
		sections, err := ctrler.sectionRepository.GetMainCollections()
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("GetMainCollectionsErr"))
		}
		ctx.JSON(httpresp.Success(http.StatusOK, gin.H{"sections": sections}, "Main collections fetched."))
		return
	}
	var sections = ctrler.sectionRepository.Get()
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{"sections": sections, "tree" : tree}, "Collections fetched."))
}
func(ctrler * SectionController)UpdateSection(ctx * gin.Context){
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("convErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
	}
	section := model.Section{}
	section.Id = id	
	err = ctx.ShouldBindBodyWith(&section, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("BindErr"))
	}
	fieldsErr, err := section.ValidateUpdate()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("collection update error"))
		ctx.JSON(httpresp.Fail400(gin.H{"errors": fieldsErr}, "Validation error."),)
		return 
	}
	err = ctrler.sectionRepository.Update(section)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("UpdateErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Section updated."))
}

func(ctrler * SectionController)DeleteCollection(ctx * gin.Context){
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("convErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
	}
	
	err = ctrler.sectionRepository.Delete(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("DeleteErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Collection updated."))
}


func NewSectionController() SectionControllerInterface {
	return &SectionController{
		sectionRepository: repository.NewSectionRepository(),
	}

}

type SectionControllerInterface interface {
	NewCategory(ctx *gin.Context)
	GetCategories(ctx *gin.Context)
	UpdateSection(ctx * gin.Context)
	DeleteCollection(ctx * gin.Context)
}
