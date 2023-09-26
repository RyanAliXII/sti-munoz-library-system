package author

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
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
	newAuthor, insertErr := ctrler.authorRepository.New(author)
	if insertErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, insertErr.Error()))
		return
	}
	ctrler.recordMetadataRepository.InvalidatePersonAsAuthor()
	ctx.JSON(httpresp.Success200(gin.H{
		"author": newAuthor,
	}, "Author has been added."))
}
func (ctrler *AuthorController) GetAuthors(ctx *gin.Context) {

	filter := filter.ExtractFilter(ctx)
	authors := ctrler.authorRepository.Get(&filter)
	metaData, metaErr := ctrler.recordMetadataRepository.GetPersonAsAuthorMetadata(filter.Limit)
	if metaErr != nil {
		ctx.JSON(httpresp.Fail500(gin.H{
			"message": "Unknown error occured",
		}, "Invalid page number."))
        return
	}
	ctx.JSON(httpresp.Success200(gin.H{"authors": authors, "metaData": metaData,}, "Authors fetched."))
}

func (ctrler *AuthorController) DeleteAuthor(ctx *gin.Context) {
	id := ctx.Param("id")
	err := ctrler.authorRepository.Delete(id)
	if err != nil {
		ctx.JSON(httpresp.Fail500(gin.H{}, err.Error()))
		return
	}
	ctrler.recordMetadataRepository.InvalidatePersonAsAuthor()
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
	updateErr := ctrler.authorRepository.Update(id, author)
	if updateErr != nil {
		ctx.JSON(httpresp.Fail500(gin.H{}, updateErr.Error()))
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "model.PersonAsAuthor Updated"))
}

func NewAuthorController() AuthorControllerInterface {

	return &AuthorController{
		authorRepository: repository.NewAuthorRepository(),
		recordMetadataRepository: repository.NewRecordMetadataRepository(),
	}

}

type AuthorControllerInterface interface {
	NewAuthor(ctx *gin.Context)
	GetAuthors(ctx *gin.Context)
	DeleteAuthor(ctx *gin.Context)
	UpdateAuthor(ctx *gin.Context)

}
