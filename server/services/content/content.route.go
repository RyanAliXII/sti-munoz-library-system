package content

import (
	"github.com/gin-gonic/gin"
)


func ContentRoutes(router * gin.RouterGroup){
	ctrler := NewContentController()
	router.POST("",ctrler.UploadFile)
}