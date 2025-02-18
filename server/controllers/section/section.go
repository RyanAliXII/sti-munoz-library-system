package section

import (
	"net/http"
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type Section struct {
	services * services.Services
}

func (ctrler *Section) NewCategory(ctx *gin.Context) {
	var body model.Section
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	fields, err := ctrler.services.Validator.CollectionValidator.ValidateNew(&body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("validation error."))
		ctx.JSON(httpresp.Fail400(gin.H{
			"errors": fields,
		}, "Validation error."))
		return 
	}	
	err = ctrler.services.Repos.SectionRepository.New(body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("New collection error"))
		ctx.JSON(httpresp.Fail500(gin.H{
			"errors": fields,
		}, "Validation error."))
		return
	}
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{}, "model.Section created."))
}
func (ctrler *Section)GetCategories(ctx *gin.Context) {

	var sections = ctrler.services.Repos.SectionRepository.Get()
	tree := ctrler.services.Repos.SectionRepository.TransformToTree(sections)
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{"sections": sections, "tree" : tree}, "Collections fetched."))
}
func(ctrler * Section)UpdateSection(ctx * gin.Context){
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
	fieldsErr, err := ctrler.services.Validator.CollectionValidator.ValidateUpdate(&section)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("collection update error"))
		ctx.JSON(httpresp.Fail400(gin.H{"errors": fieldsErr}, "Validation error."),)
		return 
	}
	err = ctrler.services.Repos.SectionRepository.Update(section)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("UpdateErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Section updated."))
}

func(ctrler * Section)DeleteCollection(ctx * gin.Context){
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("convErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
	}
	
	err = ctrler.services.Repos.SectionRepository.Delete(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("DeleteErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Collection updated."))
}


func NewSectionController(services * services.Services) SectionController {
	return &Section{
		services: services,
	}

}

type SectionController interface {
	NewCategory(ctx *gin.Context)
	GetCategories(ctx *gin.Context)
	UpdateSection(ctx * gin.Context)
	DeleteCollection(ctx * gin.Context)
}
