package categorysrc

import (
	"slim-app/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func CategoryRoutes(router *gin.RouterGroup) {
	var controller CategoryControllerInterface = &CategoryController{}
	router.GET("/", controller.GetCategories)
	router.POST("/", middlewares.ValidateBody[CreateCategoryBody], controller.NewCategory)
}
