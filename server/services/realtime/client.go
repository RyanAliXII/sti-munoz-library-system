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



func (ctrler *RealtimeController) InitializeClientWebSocket(ctx *gin.Context) {
	connection, connectionErr := NewWebSocket(ctx.Writer, ctx.Request)
	if connectionErr != nil {
		logger.Error(connectionErr.Error())
		return
	}
	
	go ctrler.ClientReader(connection, ctx)
	go ctrler.ClientWriter(connection, ctx)

}


func (ctrler *RealtimeController) ClientReader(connection *websocket.Conn, ctx *gin.Context) {
	accountId := ctx.Query("accountId")
	defer func() {
		logger.Info("Reader Exited.", zap.String("accountId", accountId))
		connection.Close()
	}()
  
	connection.SetReadDeadline(time.Now().Add(pongWait))
	connection.SetPongHandler(func(string) error { connection.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, _, err := connection.ReadMessage()
		
		if err != nil {
			logger.Error(err.Error())
			break
		}
	}
}
func (ctrler *RealtimeController) ClientWriter(connection *websocket.Conn, ctx *gin.Context) {
	ticker := time.NewTicker(time.Second * 3)
	accountId := ctx.Query("account")
	context, cancel := context.WithCancel(context.Background())
	notificationBroadcaster := broadcasting.NewNotificationBroadcaster()
	go notificationBroadcaster.ListenByRoutingKey(fmt.Sprintf("notify_client_%s", accountId), context)
	
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
				logger.Error(writeErr.Error(), slimlog.Function("RealtimeController.ClientWriter"), slimlog.Error("writeErr"))
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