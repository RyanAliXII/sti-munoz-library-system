package section

import (
	"slim-app/server/app/http/middlewares"
	"slim-app/server/app/repository"

	"github.com/gin-gonic/gin"
)

func SectionRoutes(router *gin.RouterGroup, repos *repository.Repositories) {
	var controller SectionControllerInterface = &SectionController{
		repos: repos,
	}
	router.GET("/", controller.GetCategories)
	router.POST("/", middlewares.ValidateBody[SectionBody], controller.NewCategory)
}
