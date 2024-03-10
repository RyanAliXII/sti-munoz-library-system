package realtime

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

func RealtimeRoutes(router *gin.RouterGroup, s * services.Services) {
	ctrler := NewController(s)
	router.GET("/ws", ctrler.InitializeWebSocket)
	router.GET("/client/ws", ctrler.InitializeClientWebSocket)
}
