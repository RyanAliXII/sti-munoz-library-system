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
	repos *repository.Repositories
}

func (ctrler *AuthorController) NewAuthor(ctx *gin.Context) {
	var author model.Author = model.Author{}

	ctx.ShouldBindBodyWith(&author, binding.JSON)
	insertErr := ctrler.repos.AuthorRepository.New(author)
	if insertErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, insertErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "model.Author added."))
}
func (ctrler *AuthorController) GetAuthors(ctx *gin.Context) {
	var authors []model.Author = ctrler.repos.AuthorRepository.Get()
	ctx.JSON(httpresp.Success200(gin.H{"authors": authors}, "Authors fetched."))
}

func (ctrler *AuthorController) DeleteAuthor(ctx *gin.Context) {
	id, castErr := strconv.Atoi(ctx.Param("id"))
	if castErr != nil {
		logger.Warn(castErr.Error())
		ctx.JSON(httpresp.Fail400(gin.H{}, castErr.Error()))
		return
	}
	err := ctrler.repos.AuthorRepository.Delete(id)
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
	updateErr := ctrler.repos.AuthorRepository.Update(id, author)
	if updateErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, updateErr.Error()))
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "model.Author Updated"))
}
func NewAuthorController(repos *repository.Repositories) AuthorControllerInterface {
	return &AuthorController{
		repos: repos,
	}

}

type AuthorControllerInterface interface {
	NewAuthor(ctx *gin.Context)
	GetAuthors(ctx *gin.Context)
	DeleteAuthor(ctx *gin.Context)
	UpdateAuthor(ctx *gin.Context)
}
