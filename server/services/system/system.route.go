package system

import (
	"github.com/gin-gonic/gin"
)

func SystemRoutes(router *gin.RouterGroup) {
	ctrler := NewSystemConctroller()
	router.GET("/modules", ctrler.GetModules)

}
