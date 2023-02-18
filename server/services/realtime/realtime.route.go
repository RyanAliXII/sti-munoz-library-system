package realtime

import (
	"slim-app/server/app/broadcasting"

	"github.com/gin-gonic/gin"
)

func RealtimeRoutes(router *gin.RouterGroup, broadcasters *broadcasting.Broadcasters) {
	ctrler := NewController(broadcasters)
	router.GET("/ws", ctrler.InitializeWebSocket)
}
