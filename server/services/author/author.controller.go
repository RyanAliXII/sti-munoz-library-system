package author

import (
	"slim-app/server/app/http/httpresp"
	"slim-app/server/model"
	"slim-app/server/repository"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type AuthorController struct {
	authorRepository repository.AuthorRepositoryInterface
}

func (ctrler *AuthorController) NewAuthor(ctx *gin.Context) {
	var author model.Author = model.Author{}

	ctx.ShouldBindBodyWith(&author, binding.JSON)
	insertErr := ctrler.authorRepository.New(author)
	if insertErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, insertErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "model.Author added."))
}
func (ctrler *AuthorController) GetAuthors(ctx *gin.Context) {
	var authors []model.Author = ctrler.authorRepository.Get()
	ctx.JSON(httpresp.Success200(gin.H{"authors": authors}, "Authors fetched."))
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
	ctx.JSON(httpresp.Success200(gin.H{}, "model.Author deleted."))
}

func (ctrler *AuthorController) UpdateAuthor(ctx *gin.Context) {
	id, castErr := strconv.Atoi(ctx.Param("id"))
	if castErr != nil {
		logger.Warn(castErr.Error())
		ctx.JSON(httpresp.Fail400(gin.H{}, castErr.Error()))
	}
	var author model.Author
	bindingErr := ctx.ShouldBindBodyWith(&author, binding.JSON)
	if bindingErr != nil {
		logger.Error(bindingErr.Error())
		ctx.JSON(httpresp.Fail400(gin.H{}, bindingErr.Error()))
	}
	updateErr := ctrler.authorRepository.Update(id, author)
	if updateErr != nil {
		ctx.JSON(httpresp.Fail500(gin.H{}, updateErr.Error()))
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "model.Author Updated"))
}
func (ctrler *AuthorController) NewOrganizationAsAuthor(ctx *gin.Context) {
	org := model.Organization{}
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
	org := model.Organization{}
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
