package routes

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/printables"
	"github.com/gin-gonic/gin"
)




func RegisterPrintablesGeneratorRoutes(router * gin.Engine){
	ctrler := printables.NewBookPrintableController()
	grp := router.Group("/printables-generator")
	grp.GET("/books/:id", ctrler.RenderBookPrintables)
}