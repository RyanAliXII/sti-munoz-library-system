package author

import (
	"fmt"
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
		ctx.JSON(httpresp.Fail400(gin.H{}, err.Error()))
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
		ctx.JSON(httpresp.Fail400(gin.H{}, updateErr.Error()))
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "model.Author Updated"))
}
func (ctrler *AuthorController) NewOrganizationAsAuthor(ctx *gin.Context) {
	org := model.OrganizationAsAuthor{}
	ctx.ShouldBindBodyWith(&org, binding.JSON)
	fmt.Println(org)
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
}
