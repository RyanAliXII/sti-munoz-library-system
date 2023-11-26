package game

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)



func GameRoutes(router * gin.RouterGroup) {
	ctrler := NewGameController()
	router.GET("", middlewares.BlockRequestFromClientApp, ctrler.GetGames)
	router.POST("",middlewares.ValidateBody[GameBody], middlewares.BlockRequestFromClientApp, ctrler.NewGame)
	router.PUT("/:id", middlewares.BlockRequestFromClientApp, middlewares.ValidateBody[GameBody], ctrler.UpdateGame)
	router.DELETE("/:id", middlewares.BlockRequestFromClientApp, ctrler.DeleteGame)
	router.POST("/logs", middlewares.BlockRequestFromClientApp, middlewares.ValidateBody[GameLogBody],  ctrler.LogGame)
	router.GET("/logs", middlewares.BlockRequestFromClientApp, ctrler.GetGameLogs)
	router.DELETE("/logs/:id", middlewares.BlockRequestFromClientApp, ctrler.DeleteGameLog)
	router.PUT("/logs/:id", middlewares.BlockRequestFromClientApp, ctrler.UpdateGameLog)
}