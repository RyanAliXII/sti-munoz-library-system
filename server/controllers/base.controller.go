package controllers

import (
	"net/http"
	"ryanali12/web_service/app/repository"

	"github.com/gin-gonic/gin"
)

type BaseController struct {
	Repos *repository.Repositories
}

func (ctrl *BaseController) ReturnIndexPage(ctx *gin.Context) {
	ctx.HTML(http.StatusOK, "public/index.html", nil)
}
func (ctrl *BaseController) ReturnProductPage(ctx *gin.Context) {
	ctx.HTML(http.StatusOK, "public/product.html", nil)
}
