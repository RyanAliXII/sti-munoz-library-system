package game

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)



func GameRoutes(router * gin.RouterGroup) {
	ctrler := NewGameController()
	router.POST("",middlewares.ValidateBody[GameBody], ctrler.NewGame)
}