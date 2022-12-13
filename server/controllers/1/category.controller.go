package controllers

import (
	"net/http"
	"slim-app/server/app/http/definitions"

	"github.com/gin-gonic/gin"
)

type CategoryController struct{}

func (ctrler *CategoryController) NewCategory(ctx *gin.Context) {
	ctx.JSON(definitions.Success(http.StatusOK, gin.H{}, "Category created."))
}
func (ctrler *CategoryController) GetCategories(ctx *gin.Context) {
	ctx.JSON(definitions.Success(http.StatusOK, gin.H{"categories": []gin.H{}}, "Categories fetched."))
}
