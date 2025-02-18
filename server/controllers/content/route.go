package content

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)


func ContentRoutes(router * gin.RouterGroup, services * services.Services){
	ctrler := NewContentController(services)
	router.POST("",middlewares.BlockRequestFromClientApp(services.Config.AdminAppClientID), ctrler.UploadFile)
}