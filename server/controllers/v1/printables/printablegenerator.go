package printables

import (
	"github.com/gin-gonic/gin"
)




func RegisterPrintablesGeneratorRoutes(router * gin.RouterGroup){
	ctrler := NewBookPrintableController()
	router.GET("/books/:id", ctrler.RenderBookPrintables)
}