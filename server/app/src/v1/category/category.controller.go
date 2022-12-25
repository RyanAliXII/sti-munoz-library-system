package categorysrc

import (
	"net/http"
	"slim-app/server/app/http/httpresp"
	"slim-app/server/app/model"
	"slim-app/server/app/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type CategoryController struct {
	repos *repository.Repositories
}

func (ctrler *CategoryController) NewCategory(ctx *gin.Context) {
	var body CategoryBody
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	ctrler.repos.CategoryRepository.New(model.Category{
		Name: body.Name,
	})

	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{}, "Category created."))
}
func (ctrler *CategoryController) GetCategories(ctx *gin.Context) {
	var categories = ctrler.repos.CategoryRepository.Get()
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{"categories": categories}, "Categories fetched."))
}

type CategoryControllerInterface interface {
	NewCategory(ctx *gin.Context)
	GetCategories(ctx *gin.Context)
}
