package realtime

import (
	"context"
	"slim-app/server/app/broadcasting"
	"slim-app/server/app/pkg/slimlog"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

type RealtimeController struct {
	// repos *repository.Repositories
	// broadcasters *broadcasting.Broadcasters
}

func (ctrler *RealtimeController) InitializeWebSocket(ctx *gin.Context) {
	connection, connectionErr := NewWebSocket(ctx.Writer, ctx.Request)
	if connectionErr != nil {
		return
	}
	go ctrler.Reader(connection, ctx)
	go ctrler.Writer(connection, ctx)

}
func (ctrler *RealtimeController) Reader(connection *websocket.Conn, ctx *gin.Context) {
	for {
		_, _, err := connection.ReadMessage()
		if err != nil {
			break
		}
	}
}
func (ctrler *RealtimeController) Writer(connection *websocket.Conn, ctx *gin.Context) {
	ticker := time.NewTicker(time.Second * 1)
	accountId := ctx.Query("accountId")
	context, cancel := context.WithCancel(context.Background())
	notificationBroadcaster := broadcasting.NewNotificationBroadcaster()
	go notificationBroadcaster.ListenByAccountId(accountId, context)

loop:
	for {
		select {
		case <-notificationBroadcaster.Stop():
			cancel()
			break loop

		case d := <-notificationBroadcaster.Message():
			writeErr := connection.WriteMessage(websocket.TextMessage, d.Body)
			if writeErr != nil {
				logger.Error(writeErr.Error(), slimlog.Function("RealtimeController.Writer"), slimlog.Error("writeErr"))
				cancel()
				break loop

			}
		case <-ticker.C:
			connection.SetWriteDeadline(time.Now().Add(time.Second * 2))
			if err := connection.WriteMessage(websocket.PingMessage, nil); err != nil {
				ticker.Stop()
				cancel()
				break loop
			}
		}

	}
	connection.Close()
	logger.Warn("Socket has been closed.", zap.String("account", accountId))
}
func NewController() RealtimeControllerInteface {
	return &RealtimeController{}
}

type RealtimeControllerInteface interface {
	InitializeWebSocket(ctx *gin.Context)
}
