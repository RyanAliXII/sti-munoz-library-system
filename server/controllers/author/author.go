package author

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type Author struct {
	services * services.Services
}

func (ctrler *Author) NewAuthor(ctx *gin.Context) {
	var author model.Author= model.Author{}
	ctx.ShouldBindBodyWith(&author, binding.JSON)
	fieldErr, err := ctrler.services.Validator.AuthorValidator.ValidateNew(&author)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("Validation error"))
		ctx.JSON(httpresp.Fail400(gin.H{"errors": fieldErr}, "Validation error."))
		return
	}
	newAuthor, insertErr := ctrler.services.Repos.AuthorRepository.New(author)
	if insertErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, insertErr.Error()))
		return	
	}
	ctrler.services.Repos.RecordMetadataRepository.InvalidateAuthor()
	ctx.JSON(httpresp.Success200(gin.H{
		"author": newAuthor,
	}, "Author has been added."))
}
func (ctrler *Author) GetAuthors(ctx *gin.Context) {
	filter := filter.ExtractFilter(ctx)
	if len(filter.Keyword) > 0 {
		metaData, metaErr := ctrler.services.Repos.RecordMetadataRepository.GetAuthorSearchMetadata(filter)
		if metaErr != nil {
			ctrler.services.Logger.Error(metaErr.Error(), applog.Error("AuthorSearchMetadataErr"))
			ctx.JSON(httpresp.Fail500(gin.H{
				"message": "Unknown error occured",
			}, "Invalid page number."))
			return
		}
		authors := ctrler.services.Repos.AuthorRepository.Search(&filter)
		ctx.JSON(httpresp.Success200(gin.H{"authors": authors, "metaData": metaData,}, "Authors fetched."))
		return
	}
	metaData, metaErr := ctrler.services.Repos.RecordMetadataRepository.GetAuthorMetadata(filter.Limit)
	if metaErr != nil {
		ctx.JSON(httpresp.Fail500(gin.H{
			"message": "Unknown error occured",
		}, "Invalid page number."))
        return
	}
	authors := ctrler.services.Repos.AuthorRepository.Get(&filter)
	ctx.JSON(httpresp.Success200(gin.H{"authors": authors, "metaData": metaData,}, "Authors fetched."))
}

func (ctrler *Author) DeleteAuthor(ctx *gin.Context) {
	id := ctx.Param("id")
	err := ctrler.services.Repos.AuthorRepository.Delete(id)
	if err != nil {
		ctx.JSON(httpresp.Fail500(gin.H{}, err.Error()))
		return
	}
	ctrler.services.Repos.RecordMetadataRepository.InvalidateAuthor()
	ctx.JSON(httpresp.Success200(gin.H{}, "model.PersonAsAuthor deleted."))
}

func (ctrler *Author) UpdateAuthor(ctx *gin.Context) {
	id := ctx.Param("id")
	var author model.Author;
	bindingErr := ctx.ShouldBindBodyWith(&author, binding.JSON)
	if bindingErr != nil {
		ctrler.services.Logger.Error(bindingErr.Error())
		ctx.JSON(httpresp.Fail400(gin.H{}, bindingErr.Error()))
	}
	author.Id = id
	fieldErr, err := ctrler.services.Validator.AuthorValidator.ValidateUpdate(&author)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("Validation error"))
		ctx.JSON(httpresp.Fail400(gin.H{"errors": fieldErr}, "Validation error."))
		return
	}
	updateErr := ctrler.services.Repos.AuthorRepository.Update(id, author)
	if updateErr != nil {
		ctx.JSON(httpresp.Fail500(gin.H{}, updateErr.Error()))
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "model.PersonAsAuthor Updated"))
}

func NewAuthorController(services * services.Services) AuthorController {
	return &Author{
		services: services,
	}
}
type AuthorController interface {
	NewAuthor(ctx *gin.Context)
	GetAuthors(ctx *gin.Context)
	DeleteAuthor(ctx *gin.Context)
	UpdateAuthor(ctx *gin.Context)

}
