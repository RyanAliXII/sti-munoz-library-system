package section

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func SectionRoutes(router *gin.RouterGroup) {
	var controller SectionControllerInterface = NewSectionController()
	router.Use(middlewares.ValidatePermissions("Section.Access"))
	// router.Use(middlewares.BlockRequestFromClientApp)
	router.GET("/", 
	controller.GetCategories)
	router.POST("/", controller.NewCategory)
	router.PUT("/:id", controller.UpdateSection)
	router.DELETE("/:id", controller.DeleteCollection)
}
