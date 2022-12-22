package sofsrc

import (
	"github.com/gin-gonic/gin"
)

func FundSourceRoutes(router *gin.RouterGroup) {
	var controllers FundSourceController = FundSourceController{}
	router.GET("/", controllers.GetSources)
	router.POST("/", controllers.NewSource)
}
