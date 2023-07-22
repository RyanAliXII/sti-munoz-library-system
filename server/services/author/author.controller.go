package author

import (
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type AuthorController struct {
	authorRepository repository.AuthorRepositoryInterface
	recordMetadataRepo repository.RecordMetadataRepository
}

func (ctrler *AuthorController) NewAuthor(ctx *gin.Context) {
	var author model.PersonAsAuthor = model.PersonAsAuthor{}

	ctx.ShouldBindBodyWith(&author, binding.JSON)
	insertErr := ctrler.authorRepository.New(author)
	if insertErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, insertErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "model.PersonAsAuthor added."))
}
func (ctrler *AuthorController) GetAuthors(ctx *gin.Context) {
	page := ctx.Query("page")

	parsedPage, parsePageErr := strconv.Atoi(page)
	if parsePageErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, "Invalid page number."))
        return
	}

	if parsedPage <= 0 {
		parsedPage = 1
	}
	authors := ctrler.authorRepository.Get(&repository.Filter{
		Page: parsedPage,
	})

	metaData, metaErr := ctrler.recordMetadataRepo.GetPersonAsAuthorMetadata(30)
	if metaErr != nil {
		ctx.JSON(httpresp.Fail500(gin.H{
			"message": "Unknown error occured",
		}, "Invalid page number."))
        return
	}
	ctx.JSON(httpresp.Success200(gin.H{"authors": authors, "metaData": metaData,}, "Authors fetched."))
}

func (ctrler *AuthorController) DeleteAuthor(ctx *gin.Context) {
	id, castErr := strconv.Atoi(ctx.Param("id"))
	if castErr != nil {
		logger.Warn(castErr.Error())
		ctx.JSON(httpresp.Fail400(gin.H{}, castErr.Error()))
		return
	}
	err := ctrler.authorRepository.Delete(id)
	if err != nil {
		ctx.JSON(httpresp.Fail500(gin.H{}, err.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "model.PersonAsAuthor deleted."))
}

func (ctrler *AuthorController) UpdateAuthor(ctx *gin.Context) {
	id, castErr := strconv.Atoi(ctx.Param("id"))
	if castErr != nil {
		logger.Warn(castErr.Error())
		ctx.JSON(httpresp.Fail400(gin.H{}, castErr.Error()))
	}
	var author model.PersonAsAuthor
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
func (ctrler *AuthorController) NewOrganizationAsAuthor(ctx *gin.Context) {
	org := model.OrgAsAuthor{}
	ctx.ShouldBindBodyWith(&org, binding.JSON)

	newErr := ctrler.authorRepository.NewOrganization(org)

	if newErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "New organization has been added."))
}

func (ctrler *AuthorController) GetOrganizations(ctx *gin.Context) {
	orgs := ctrler.authorRepository.GetOrganization()
	ctx.JSON(httpresp.Success200(gin.H{
		"organizations": orgs,
	}, "Organizations fetched."))
}
func (ctrler *AuthorController) DeleteOrganization(ctx *gin.Context) {
	id := ctx.Param("id")
	parsedId, parsingErr := strconv.Atoi(id)
	if parsingErr != nil {
		ctx.JSON(httpresp.Fail400(nil, "Invalid id param."))
		return
	}
	deleteErr := ctrler.authorRepository.DeleteOrganization(parsedId)
	if deleteErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Organization deleted."))
}
func (ctrler *AuthorController) UpdateOrganization(ctx *gin.Context) {
	id := ctx.Param("id")
	parsedId, parsingErr := strconv.Atoi(id)
	if parsingErr != nil {
		ctx.JSON(httpresp.Fail400(nil, "Invalid id param."))
		return
	}
	org := model.OrgAsAuthor{}
	ctx.ShouldBindBodyWith(&org, binding.JSON)
	org.Id = parsedId
	updateErr := ctrler.authorRepository.UpdateOrganization(org)
	if updateErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Organization deleted."))
}
func NewAuthorController() AuthorControllerInterface {
	authorRepo := repository.NewAuthorRepository()
	return &AuthorController{
		authorRepository: authorRepo,
	}

}

type AuthorControllerInterface interface {
	NewAuthor(ctx *gin.Context)
	GetAuthors(ctx *gin.Context)
	DeleteAuthor(ctx *gin.Context)
	UpdateAuthor(ctx *gin.Context)
	NewOrganizationAsAuthor(ctx *gin.Context)
	GetOrganizations(ctx *gin.Context)
	DeleteOrganization(ctx *gin.Context)
	UpdateOrganization(ctx *gin.Context)
}
