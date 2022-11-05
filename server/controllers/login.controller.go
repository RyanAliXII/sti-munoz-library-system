package controllers

import (
	"net/http"
	"ryanali12/web_service/app/http/definitions"
	"ryanali12/web_service/app/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type LoginController struct {
	Repos *repository.Repositories
}

func (ctrl *LoginController) ReturnLoginPage(ctx *gin.Context) {
	ctx.HTML(http.StatusOK, "public/login.html", nil)
}
func (ctrl *LoginController) Login(ctx *gin.Context) {
	var body definitions.LoginPostBody
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	ctx.JSON(http.StatusOK, definitions.Success(http.StatusOK, gin.H{}, "You are logged In"))
}
