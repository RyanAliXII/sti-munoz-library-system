package item

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)




func ItemRoutes(router * gin.RouterGroup){
	ctrler := NewItemController()
	router.Use(middlewares.BlockRequestFromClientApp)
	router.GET("", ctrler.GetItems)
}