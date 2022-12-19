package controllers

import (
	"fmt"
	"net/http"
	"slim-app/server/app/http/definitions"
	"slim-app/server/app/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type AuthorController struct {
	Repos *repository.Repositories
}

func (ctrler *AuthorController) NewAuthor(ctx *gin.Context) {
	var body definitions.NewAuthorBody = definitions.NewAuthorBody{}
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	insertErr := ctrler.Repos.AuthorRepository.New(definitions.AuthorModel{Id: 0, GivenName: body.GivenName, MiddleName: body.MiddleName, Surname: body.Surname})
	if insertErr != nil {
		fmt.Println(insertErr)
		ctx.JSON(definitions.Fail(http.StatusInternalServerError, gin.H{}, insertErr.Error()))
		return
	}
	ctx.JSON(definitions.Success(http.StatusOK, gin.H{}, "Author added."))
}
func (ctrler *AuthorController) GetAuthors(ctx *gin.Context) {
	var authors []definitions.AuthorModel = ctrler.Repos.AuthorRepository.Get()
	ctx.JSON(definitions.Success(http.StatusOK, gin.H{"authors": authors}, "Authors fetched."))
}

type AuthorControllerInterface interface {
	NewAuthor(ctx *gin.Context)
	GetAuthors(ctx *gin.Context)
}
