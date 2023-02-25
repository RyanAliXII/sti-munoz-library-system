package author

import (
	"slim-app/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func AuthorRoutes(router *gin.RouterGroup) {
	var controller AuthorControllerInterface = NewAuthorController()
	router.GET("/", controller.GetAuthors)
	router.POST("/", middlewares.ValidateBody[AuthorBody], controller.NewAuthor)
	router.POST("/organizations", middlewares.ValidateBody[OrganizationBody], controller.NewOrganizationAsAuthor)
	router.PUT("/:id/", middlewares.ValidateBody[AuthorBody], controller.UpdateAuthor)
	router.DELETE("/:id/", controller.DeleteAuthor)
}
