package realtime

import (
	"context"
	"fmt"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/broadcasting"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

type RealtimeController struct {
	// repos *repository.Repositories
	// broadcasters *broadcasting.Broadcasters
}
const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	// pongWait = 60 * time.Second

	// // Send pings to peer with this period. Must be less than pongWait.
	// pingPeriod = (pongWait * 9) / 10

	// // Maximum message size allowed from peer.
	// maxMessageSize = 512
)

func (ctrler *RealtimeController) InitializeWebSocket(ctx *gin.Context) {
	connection, connectionErr := NewWebSocket(ctx.Writer, ctx.Request)
	if connectionErr != nil {
		logger.Error(connectionErr.Error())
		return
	}
	
	go ctrler.Reader(connection, ctx)
	go ctrler.Writer(connection, ctx)

}
func (ctrler *RealtimeController) Reader(connection *websocket.Conn, ctx *gin.Context) {
	accountId := ctx.Query("accountId")
	defer func() {
		logger.Info("Reader Exited.", zap.String("accountId", accountId))
		connection.Close()
	}()
  
	//connection.SetReadDeadline(time.Now().Add(pongWait))
	//connection.SetPongHandler(func(string) error { connection.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, _, err := connection.ReadMessage()
		
		if err != nil {
			logger.Error(err.Error())
			break
		}
	}
}
func (ctrler *RealtimeController) Writer(connection *websocket.Conn, ctx *gin.Context) {
	ticker := time.NewTicker(time.Second * 3)
	accountId := ctx.Query("account")
	context, cancel := context.WithCancel(context.Background())
	notificationBroadcaster := broadcasting.NewNotificationBroadcaster()
	go notificationBroadcaster.ListenByRoutingKey(fmt.Sprintf("notify_admin_%s", accountId), context)
	
	defer func() {
		logger.Info("Writer Exited.", zap.String("accountId", accountId))
		connection.Close()
		cancel()
		ticker.Stop()
	}() 
	
	for {
		select {
		case <-notificationBroadcaster.Stop():
			cancel()
			return
			
		case d := <-notificationBroadcaster.Message():
		
			writeErr := connection.WriteMessage(websocket.TextMessage, d.Body)
			if writeErr != nil {
				logger.Error(writeErr.Error(), slimlog.Function("RealtimeController.Writer"), slimlog.Error("writeErr"))
				cancel()
				return
			}
		case <-ticker.C:
			connection.SetWriteDeadline(time.Now().Add(writeWait))
			if err := connection.WriteMessage(websocket.PingMessage, nil); err != nil {	
				logger.Error(err.Error())
				cancel()
				return
			}
			
		}

	}
	
}
func NewController() RealtimeControllerInteface {
	return &RealtimeController{}
}

type RealtimeControllerInteface interface {
	InitializeWebSocket(ctx *gin.Context)
}
