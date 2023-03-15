package section

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func SectionRoutes(router *gin.RouterGroup) {
	var controller SectionControllerInterface = NewSectionController()
	router.GET("/", 
	middlewares.ValidatePermissions([]string{"Section.Read"}),
	controller.GetCategories)
	router.POST("/",
	middlewares.ValidatePermissions([]string{"Section.Add"}),
	middlewares.ValidateBody[SectionBody],
	controller.NewCategory)
}
