package notification

import (
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}
var logger = slimlog.GetInstance()

func NewWebSocket(writer gin.ResponseWriter, request *http.Request) (*websocket.Conn, error) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	connection, connectionErr := upgrader.Upgrade(writer, request, nil)

	if connectionErr != nil {
		logger.Error(connectionErr.Error(), slimlog.Function("Websocket.New"), slimlog.Error("connectionErr"))

	}

	return connection, nil
}
