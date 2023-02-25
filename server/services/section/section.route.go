package section

import (
	"slim-app/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func SectionRoutes(router *gin.RouterGroup) {
	var controller SectionControllerInterface = NewSectionController()
	router.GET("/", controller.GetCategories)
	router.POST("/", middlewares.ValidateBody[SectionBody], controller.NewCategory)
}
