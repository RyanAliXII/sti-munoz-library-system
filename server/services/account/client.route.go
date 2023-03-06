package account

import (
	"github.com/gin-gonic/gin"
)

func ClientRoutes(router *gin.RouterGroup) {
	var ctrler AccountControllerInterface = NewAccountController()
	router.GET("/", ctrler.GetAccounts)
	router.POST("/bulk", ctrler.ImportAccount)
}
