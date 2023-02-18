package realtime

import (
	"slim-app/server/app/pkg/ws"
	"slim-app/server/repository"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type RealtimeController struct {
	repos *repository.Repositories
}

func (ctrler *RealtimeController) InitializeWebSocket(ctx *gin.Context) {
	// id := ctx.Query("id")

	connection, _ := ws.New(ctx.Writer, ctx.Request)

	go connection.Reader()
	go connection.Writer(ctrler.repos, ctx)

}

func NewController(repos *repository.Repositories) RealtimeControllerInteface {
	return &RealtimeController{
		repos: repos,
	}
}

type RealtimeControllerInteface interface {
	InitializeWebSocket(ctx *gin.Context)
}
