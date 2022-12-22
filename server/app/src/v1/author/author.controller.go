package authorsrc

import (
	"slim-app/server/app/http/httpresp"
	"slim-app/server/app/model"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/app/repository"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type AuthorController struct {
	Repos *repository.Repositories
}

var logger = slimlog.GetInstance()

func (ctrler *AuthorController) NewAuthor(ctx *gin.Context) {
	var body model.Author = model.Author{}

	bindingErr := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if bindingErr != nil {
		logger.Error(bindingErr.Error())
		ctx.JSON(httpresp.Fail400(gin.H{}, bindingErr.Error()))
	}
	insertErr := ctrler.Repos.AuthorRepository.New(body)
	if insertErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, insertErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "Author added."))
}
func (ctrler *AuthorController) GetAuthors(ctx *gin.Context) {
	var authors []model.Author = ctrler.Repos.AuthorRepository.Get()
	ctx.JSON(httpresp.Success200(gin.H{"authors": authors}, "Authors fetched."))
}

func (ctrler *AuthorController) DeleteAuthor(ctx *gin.Context) {
	id, castErr := strconv.Atoi(ctx.Param("id"))
	if castErr != nil {
		logger.Warn(castErr.Error())
		ctx.JSON(httpresp.Fail400(gin.H{}, castErr.Error()))
	}
	err := ctrler.Repos.AuthorRepository.Delete(id)
	if err != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, err.Error()))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "Author deleted."))
}

func (ctrler *AuthorController) UpdateAuthor(ctx *gin.Context) {
	id, castErr := strconv.Atoi(ctx.Param("id"))
	if castErr != nil {
		logger.Warn(castErr.Error())
		ctx.JSON(httpresp.Fail400(gin.H{}, castErr.Error()))
	}
	var author AuthorBody
	bindingErr := ctx.ShouldBindBodyWith(&author, binding.JSON)
	if bindingErr != nil {
		logger.Error(bindingErr.Error())
		ctx.JSON(httpresp.Fail400(gin.H{}, bindingErr.Error()))
	}
	updateErr := ctrler.Repos.AuthorRepository.Update(id, model.Author{GivenName: author.GivenName, MiddleName: author.MiddleName, Surname: author.Surname})
	if updateErr != nil {
		ctx.JSON(httpresp.Fail400(gin.H{}, updateErr.Error()))
	}
	ctx.JSON(httpresp.Success200(gin.H{}, "Author Updated"))
}

type AuthorControllerInterface interface {
	NewAuthor(ctx *gin.Context)
	GetAuthors(ctx *gin.Context)
	DeleteAuthor(ctx *gin.Context)
	UpdateAuthor(ctx *gin.Context)
}
