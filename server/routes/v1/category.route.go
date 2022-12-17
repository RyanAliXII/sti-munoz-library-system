package routes

import (
	"slim-app/server/app/http/definitions"
	"slim-app/server/app/http/middlewares"
	"slim-app/server/controllers"

	"github.com/gin-gonic/gin"
)

func CategoryRoutes(router *gin.RouterGroup, ctlers *controllers.ControllersV1) {

	router.GET("/", ctlers.CategoryController.GetCategories)
	router.POST("/", middlewares.ValidateBody[definitions.CreateCategoryBody], ctlers.CategoryController.NewCategory)
}
