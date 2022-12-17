package controllers

import (
	"net/http"
	"slim-app/server/app/http/definitions"

	"github.com/gin-gonic/gin"
)

type Author struct {
	GivenName  string `json:"givenName"`
	MiddleName string `json:"middleName"`
	Surname    string `json:"surname"`
}
type AuthorController struct{}

func (ctrler *AuthorController) NewAuthor(ctx *gin.Context) {
	ctx.JSON(definitions.Success(http.StatusOK, gin.H{}, "Author added."))
}
func (ctrler *AuthorController) GetAuthors(ctx *gin.Context) {

	var testAuthors []Author = []Author{{GivenName: "Ryan", MiddleName: "A.", Surname: "Ali"}, {GivenName: "Mark Allen", MiddleName: "A.", Surname: "Geamoga"}}
	ctx.JSON(definitions.Success(http.StatusOK, gin.H{"authors": testAuthors}, "Authors fetched."))
}
