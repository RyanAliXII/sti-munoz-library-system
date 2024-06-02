package printables

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

func RegisterPrintablesRoutes(router * gin.RouterGroup, services * services.Services){ 
	bookPrintalableCtrler := NewBookPrintableController(services)
	router.GET("/books/:id", bookPrintalableCtrler.GetBookPrintablesByBookId)
}