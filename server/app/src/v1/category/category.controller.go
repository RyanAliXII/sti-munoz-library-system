package categorysrc

import (
	"net/http"
	"slim-app/server/app/http/httpresp"

	"github.com/gin-gonic/gin"
)

type CategoryController struct{}

func (ctrler *CategoryController) NewCategory(ctx *gin.Context) {
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{}, "Category created."))
}
func (ctrler *CategoryController) GetCategories(ctx *gin.Context) {
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{"categories": []gin.H{}}, "Categories fetched."))
}

type CategoryControllerInterface interface {
	NewCategory(ctx *gin.Context)
	GetCategories(ctx *gin.Context)
}
