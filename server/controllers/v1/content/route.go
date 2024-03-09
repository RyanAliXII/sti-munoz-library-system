package content

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)


func ContentRoutes(router * gin.RouterGroup){
	ctrler := NewContentController()
	router.POST("",middlewares.BlockRequestFromClientApp, ctrler.UploadFile)
}