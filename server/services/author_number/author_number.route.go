package authornum

import (
	"github.com/gin-gonic/gin"
)

func AuthorNumberRoutes(router *gin.RouterGroup) {
	var controller AuthorNumberControllerInterface = NewAuthorNumberController()
	router.GET("/", controller.GetAuthorNumbers)
}
