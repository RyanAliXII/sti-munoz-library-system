package routes

import (
	"github.com/gin-gonic/gin"
)




func RegisterPrintablesGeneratorRoutes(router * gin.Engine){
	grp := router.Group("/printables-generator")
	grp.GET("/books/:id", func(ctx *gin.Context) {
		
	})
}