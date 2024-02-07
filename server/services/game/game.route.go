package game

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)



func GameRoutes(router * gin.RouterGroup) {
	ctrler := NewGameController()
	router.GET("", 
	middlewares.ValidatePermissions([]string{"Game.Read"}, true),
	ctrler.GetGames)

	router.POST("",
	middlewares.ValidatePermissions([]string{"Game.Read"}, true),
	middlewares.ValidateBody[GameBody], 
	ctrler.NewGame)
	
	router.PUT("/:id",
	middlewares.ValidatePermissions([]string{"Game.Edit"}, true),
	middlewares.ValidateBody[GameBody], ctrler.UpdateGame)
	router.DELETE("/:id",
	middlewares.ValidatePermissions([]string{"Game.Delete"}, true),
	ctrler.DeleteGame)
	
	router.POST("/logs", 
	middlewares.ValidatePermissions([]string{"GameLog.Add"}, true),
	middlewares.ValidateBody[GameLogBody],  ctrler.LogGame)
	
	router.GET("/logs", 
	middlewares.ValidatePermissions([]string{"GameLog.Read"}, true),
	ctrler.GetGameLogs)

	router.DELETE("/logs/:id",
	middlewares.ValidatePermissions([]string{"GameLog.Delete"}, true),
	ctrler.DeleteGameLog)

	router.PUT("/logs/:id",
	middlewares.ValidatePermissions([]string{"GameLog.Edit"}, true),
	ctrler.UpdateGameLog)
	
	router.PATCH("/logs/:id/logout",
	middlewares.ValidatePermissions([]string{"GameLog.Edit"}, true), 
	ctrler.LogoutGame)
} 