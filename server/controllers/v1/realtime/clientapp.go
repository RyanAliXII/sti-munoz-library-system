package realtime

import (
	"context"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)



func (ctrler *RealtimeController) InitializeClientWebSocket(ctx *gin.Context) {
	connection, connectionErr := NewWebSocket(ctx.Writer, ctx.Request)
	if connectionErr != nil {
		logger.Error(connectionErr.Error())
		return
	}
	if connection == nil {
		logger.Error("websocket connection is nil")
		return
	}
	
	go ctrler.ClientReader(connection, ctx)
	go ctrler.ClientWriter(connection, ctx)
}


func (ctrler *RealtimeController) ClientReader(connection *websocket.Conn, ctx *gin.Context) {

	defer func() {
	
		if connection != nil {
			connection.Close()
		}
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
	routingKey := fmt.Sprintf("notify_client_%s", accountId)
	hub := ctrler.services.Notification.NewHub()
	go hub.ListenByRoutingKey(routingKey, context)
	defer func() {
		
		if connection != nil {
			connection.Close()
		}
		cancel()
		ticker.Stop()
	}() 
	
	for {
		select {
		case <-hub.Stop():
			cancel()
			return
			
		case d := <-hub.Message():
			writeErr := connection.WriteMessage(websocket.TextMessage, d.Body)
			if writeErr != nil {
				cancel()
				return
			}
		case <-ticker.C:
			connection.SetWriteDeadline(time.Now().Add(writeWait))
			if err := connection.WriteMessage(websocket.PingMessage, nil); err != nil {	
				cancel()
				return
			}
			
		}

	}
	
}