package realtime

import (
	"context"
	"fmt"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type RealtimeController struct {
	// repos *repository.Repositories
	// broadcasters *broadcasting.Broadcasters
	services * services.Services
}
const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	//Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	//pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	//maxMessageSize = 512
)

func (ctrler *RealtimeController) InitializeWebSocket(ctx *gin.Context) {
	connection, connectionErr := NewWebSocket(ctx.Writer, ctx.Request)
	if connectionErr != nil {
		logger.Error(connectionErr.Error())
		return
	}
	if connection == nil {
		logger.Error("websocket connection is nil")
		return
	}
	
	go ctrler.Reader(connection, ctx)
	go ctrler.Writer(connection, ctx)

}
func (ctrler *RealtimeController) Reader(connection *websocket.Conn, ctx *gin.Context) {

	defer func() {
		if(connection != nil){
			connection.Close()
		}
		
	}()
  
	connection.SetReadDeadline(time.Now().Add(pongWait))
	connection.SetPongHandler(func(string) error { connection.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, _, err := connection.ReadMessage()
		if err != nil {
			_, isCloseErr := err.(*websocket.CloseError)
			if !isCloseErr {
				logger.Error(err.Error())
			}
	
			break
		}
	}
}
func (ctrler *RealtimeController) Writer(connection *websocket.Conn, ctx *gin.Context) {
	ticker := time.NewTicker(time.Second * 3)
	accountId := ctx.Query("account")
	context, cancel := context.WithCancel(context.Background())
	routingKey := fmt.Sprintf("notify_admin_%s", accountId)
	hub := ctrler.services.Notification.NewHub()
	go hub.ListenByRoutingKey(routingKey, context)
	defer func() {
		if(connection != nil){
			connection.Close()
		}
		cancel()
		ticker.Stop()
	}() 
	
	for {
		select {
		case <- hub.Stop():
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
func NewController(s * services.Services) RealtimeControllerInteface {
	return &RealtimeController{
		services: s,
	}
}

type RealtimeControllerInteface interface {
	InitializeWebSocket(ctx *gin.Context)
	InitializeClientWebSocket(ctx *gin.Context)
}
