package realtime

import (
	"github.com/gin-gonic/gin"
)

func RealtimeRoutes(router *gin.RouterGroup) {
	ctrler := NewController()
	router.GET("/ws", ctrler.InitializeWebSocket)
	router.GET("/client/ws", ctrler.InitializeClientWebSocket)
}
