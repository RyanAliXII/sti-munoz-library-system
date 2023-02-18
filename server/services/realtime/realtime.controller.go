package realtime

import (
	"slim-app/server/app/broadcasting"
	"slim-app/server/app/pkg/ws"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type RealtimeController struct {
	broadcasters *broadcasting.Broadcasters
}

func (ctrler *RealtimeController) InitializeWebSocket(ctx *gin.Context) {
	connection, _ := ws.New(ctx.Writer, ctx.Request)
	go connection.Reader()
	go connection.Writer(ctrler.broadcasters, ctx)

}

func NewController(broadcasters *broadcasting.Broadcasters) RealtimeControllerInteface {
	return &RealtimeController{
		broadcasters: broadcasters,
	}
}

type RealtimeControllerInteface interface {
	InitializeWebSocket(ctx *gin.Context)
}
