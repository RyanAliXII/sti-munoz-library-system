package author

import (
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type AuthorController struct {
	authorRepository repository.AuthorRepositoryInterface
	recordMetadataRepository  repository.RecordMetadataRepository
}

func (ctrler *AuthorController) NewAuthor(ctx *gin.Context) {
	var author model.Author= model.Author{}
	ctx.ShouldBindBodyWith(&author, binding.JSON)
	fieldErr, err := author.ValidateNew()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("Validation error"))
		ctx.JSON(httpresp.Fail400(gin.H{"errors": fieldErr}, "Validation error."))
		return
	}
	newAuthor, insertErr := ctrler.authorRepository.New(author)
	if insertErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, insertErr.Error()))
		return	
	}
	ctrler.recordMetadataRepository.InvalidateAuthor()
	ctx.JSON(httpresp.Success200(gin.H{
		"author": newAuthor,
	}, "Author has been added."))
}
func (ctrler *AuthorController) GetAuthors(ctx *gin.Context) {
	filter := filter.ExtractFilter(ctx)
	if len(filter.Keyword) > 0 {
		metaData, metaErr := ctrler.recordMetadataRepository.GetAuthorSearchMetadata(filter)
		if metaErr != nil {
			logger.Error(metaErr.Error(), slimlog.Error("AuthorSearchMetadataErr"))
			ctx.JSON(httpresp.Fail500(gin.H{
				"message": "Unknown error occured",
			}, "Invalid page number."))
			return
		}
		authors := ctrler.authorRepository.Search(&filter)
		ctx.JSON(httpresp.Success200(gin.H{"authors": authors, "metaData": metaData,}, "Authors fetched."))
		return
	}
	metaData, metaErr := ctrler.recordMetadataRepository.GetAuthorMetadata(filter.Limit)
	if metaErr != nil {
		ctx.JSON(httpresp.Fail500(gin.H{
			"message": "Unknown error occured",
		}, "Invalid page number."))
        return
	}
	authors := ctrler.authorRepository.Get(&filter)
	ctx.JSON(httpresp.Success200(gin.H{"authors": authors, "metaData": metaData,}, "Authors fetched."))
}

func (ctrler *AuthorController) DeleteAuthor(ctx *gin.Context) {
	id := ctx.Param("id")
	err := ctrler.authorRepository.Delete(id)
	if err != nil {
		ctx.JSON(httpresp.Fail500(gin.H{}, err.Error()))
		return
	}
	ctrler.recordMetadataRepository.InvalidateAuthor()
	ctx.JSON(httpresp.Success200(gin.H{}, "model.PersonAsAuthor deleted."))
}

func (ctrler *AuthorController) UpdateAuthor(ctx *gin.Context) {
	id := ctx.Param("id")
	var author model.Author;
	bindingErr := ctx.ShouldBindBodyWith(&author, binding.JSON)
	if bindingErr != nil {
		logger.Error(bindingErr.Error())
		ctx.JSON(httpresp.Fail400(gin.H{}, bindingErr.Error()))
	}
	author.Id = id
	fieldErr, err := author.ValidateUpdate()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("Validation error"))
		ctx.JSON(httpresp.Fail400(gin.H{"errors": fieldErr}, "Validation error."))
		return
	}
	updateErr := ctrler.authorRepository.Update(id, author)
	if updateErr != nil {
		ctx.JSON(httpresp.Fail500(gin.H{}, updateErr.Error()))
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "model.PersonAsAuthor Updated"))
}

func NewAuthorController() AuthorControllerInterface {

	return &AuthorController{
		authorRepository: repository.NewAuthorRepository(),
		recordMetadataRepository: repository.NewRecordMetadataRepository(repository.RecordMetadataConfig{
			 CacheExpiration: time.Minute * 5,
		}),
	}

}

type AuthorControllerInterface interface {
	NewAuthor(ctx *gin.Context)
	GetAuthors(ctx *gin.Context)
	DeleteAuthor(ctx *gin.Context)
	UpdateAuthor(ctx *gin.Context)

}
