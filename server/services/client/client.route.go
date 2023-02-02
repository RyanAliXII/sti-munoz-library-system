package client

import (
	"slim-app/server/repository"

	"github.com/gin-gonic/gin"
)

func ClientRoutes(router *gin.RouterGroup, repos *repository.Repositories) {
	var ctrler ClientControllerInterface = NewClientController(repos)
	router.GET("/accounts", ctrler.GetAccounts)
}
