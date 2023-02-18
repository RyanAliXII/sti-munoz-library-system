package ws

import (
	"fmt"
	"net/http"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/repository"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}
var logger = slimlog.BuildLogger()

type WebSocket struct {
	Connection *websocket.Conn
}

func New(writer gin.ResponseWriter, request *http.Request) (WebSocket, error) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	connection, connectionErr := upgrader.Upgrade(writer, request, nil)

	if connectionErr != nil {
		logger.Error(connectionErr.Error(), slimlog.Function("Websocket.New"), slimlog.Error("connectionErr"))
		return WebSocket{}, connectionErr
	}
	ws := WebSocket{
		Connection: connection,
	}
	return ws, nil
}
func (ws *WebSocket) Reader() {
	for {
		_, _, err := ws.Connection.ReadMessage()
		if err != nil {
			break
		}
	}
}

func (ws *WebSocket) Writer(repos *repository.Repositories, ctx *gin.Context) {
	ticker := time.NewTicker(time.Second * 1)
	accountId := ctx.Query("accountId")
	go repos.NotificationRepository.ListenByAccountId(accountId)

	for {
		select {
		case <-ticker.C:
			ws.Connection.SetWriteDeadline(time.Now().Add(time.Second * 2))
			if err := ws.Connection.WriteMessage(websocket.PingMessage, nil); err != nil {
				logger.Warn("Socket closed", zap.String("account", accountId))
				return
			}

		case d := <-repos.NotificationRepository.Message:
			writeErr := ws.Connection.WriteMessage(websocket.TextMessage, d.Body)

			if writeErr != nil {
				fmt.Println(writeErr, " Write Error")
			}

		}
	}

}
