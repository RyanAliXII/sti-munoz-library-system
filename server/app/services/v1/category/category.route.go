package category

import (
	"slim-app/server/app/http/middlewares"
	"slim-app/server/app/repository"

	"github.com/gin-gonic/gin"
)

func CategoryRoutes(router *gin.RouterGroup, repos *repository.Repositories) {
	var controller CategoryControllerInterface = &CategoryController{
		repos: repos,
	}
	router.GET("/", controller.GetCategories)
	router.POST("/", middlewares.ValidateBody[CategoryBody], controller.NewCategory)
}
