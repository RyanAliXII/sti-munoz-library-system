package printables

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

func RegisterPrintablesGeneratorRoutes(router * gin.RouterGroup, services * services.Services){
	ctrler := NewBookPrintableController(services)
	router.GET("/books/:id", ctrler.RenderBookPrintables)
}