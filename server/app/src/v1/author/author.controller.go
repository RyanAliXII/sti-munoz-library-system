package authorsrc

import (
	"net/http"
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

	ctx.ShouldBindBodyWith(&body, binding.JSON)
	insertErr := ctrler.Repos.AuthorRepository.New(body)
	if insertErr != nil {
		ctx.JSON(httpresp.Fail(http.StatusInternalServerError, gin.H{}, insertErr.Error()))
		return
	}
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{}, "Author added."))
}
func (ctrler *AuthorController) GetAuthors(ctx *gin.Context) {
	var authors []model.Author = ctrler.Repos.AuthorRepository.Get()
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{"authors": authors}, "Authors fetched."))
}

func (ctrler *AuthorController) DeleteAuthor(ctx *gin.Context) {
	id, castErr := strconv.Atoi(ctx.Param("id"))
	if castErr != nil {
		logger.Warn(castErr.Error())
		ctx.JSON(httpresp.Fail(http.StatusBadRequest, gin.H{}, castErr.Error()))
	}
	err := ctrler.Repos.AuthorRepository.Delete(id)
	if err != nil {
		ctx.JSON(httpresp.Fail(http.StatusBadRequest, gin.H{}, err.Error()))
		return
	}
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{}, "Author deleted."))
}

type AuthorControllerInterface interface {
	NewAuthor(ctx *gin.Context)
	GetAuthors(ctx *gin.Context)
	DeleteAuthor(ctx *gin.Context)
}
