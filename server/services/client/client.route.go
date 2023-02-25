package client

import (
	"github.com/gin-gonic/gin"
)

func ClientRoutes(router *gin.RouterGroup) {
	var ctrler ClientControllerInterface = NewClientController()
	router.GET("/accounts", ctrler.GetAccounts)
	router.POST("/accounts/bulk", ctrler.ImportAccount)
}
