package realtime

import (
	"slim-app/server/repository"

	"github.com/gin-gonic/gin"
)

func RealtimeRoutes(router *gin.RouterGroup) {
	repos := repository.NewRepositories()
	ctrler := NewController(repos)
	router.GET("/ws", ctrler.InitializeWebSocket)
}
