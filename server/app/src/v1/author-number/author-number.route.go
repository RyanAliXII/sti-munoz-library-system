package authornumsrc

import (
	"slim-app/server/app/repository"

	"github.com/gin-gonic/gin"
)

func AuthorNumberRoutes(router *gin.RouterGroup, repos *repository.Repositories) {
	var controller AuthorNumberControllerInterface = &AuthorNumberController{
		repos: repos,
	}
	router.GET("/", controller.GetAuthorNumbers)
	router.GET("/generator", controller.GenerateAuthorNumber)
	router.GET("/:initial", controller.GetAuthorNumbersByInitial)

}
