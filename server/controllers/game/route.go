package game

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)



func GameRoutes(router * gin.RouterGroup, services * services.Services) {
	ctrler := NewGameController(services)
	router.GET("", 
	services.PermissionValidator.Validate([]string{"Game.Read"}, true),
	ctrler.GetGames)

	router.POST("",
	services.PermissionValidator.Validate([]string{"Game.Read"}, true),
	middlewares.ValidateBody[GameBody], 
	ctrler.NewGame)
	
	router.PUT("/:id",
	services.PermissionValidator.Validate([]string{"Game.Edit"}, true),
	middlewares.ValidateBody[GameBody], ctrler.UpdateGame)
	router.DELETE("/:id",
	services.PermissionValidator.Validate([]string{"Game.Delete"}, true),
	ctrler.DeleteGame)
	
	router.POST("/logs", 
	services.PermissionValidator.Validate([]string{"GameLog.Add"}, true),
	middlewares.ValidateBody[GameLogBody],  ctrler.LogGame)
	
	router.GET("/logs", 
	services.PermissionValidator.Validate([]string{"GameLog.Read"}, true),
	ctrler.GetGameLogs)

	router.DELETE("/logs/:id",
	services.PermissionValidator.Validate([]string{"GameLog.Delete"}, true),
	ctrler.DeleteGameLog)

	router.PUT("/logs/:id",
	services.PermissionValidator.Validate([]string{"GameLog.Edit"}, true),
	ctrler.UpdateGameLog)
	
	router.PATCH("/logs/:id/logout",
	services.PermissionValidator.Validate([]string{"GameLog.Edit"}, true), 
	ctrler.LogoutGame)
} 