package item

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)




func ItemRoutes(router * gin.RouterGroup, services * services.Services){
	ctrler := NewItemController(services)
	router.Use(middlewares.BlockRequestFromClientApp)
	router.GET("", ctrler.GetItems)
}