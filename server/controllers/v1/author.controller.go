package controllers

import (
	"net/http"
	"slim-app/server/app/http/definitions"

	"github.com/gin-gonic/gin"
)

type AuthorController struct{}

func (ctrler *AuthorController) NewAuthor(ctx *gin.Context) {
	ctx.JSON(definitions.Success(http.StatusOK, gin.H{}, "Author added."))
}
func (ctrler *AuthorController) GetAuthors(ctx *gin.Context) {
	ctx.JSON(definitions.Success(http.StatusOK, gin.H{"authors": []gin.H{}}, "Authors fetched."))
}
