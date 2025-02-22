package clientlog

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)


func ClientLogRoutes (router * gin.RouterGroup, services * services.Services){
	ctrler := NewClientLogController(services)
	router.GET("/",
	services.PermissionValidator.Validate([]string{"PatronLog.Read"}, true),
	ctrler.GetClientLogs)
	router.GET("/export", services.PermissionValidator.Validate([]string{"PatronLog.Read"}, true), ctrler.ExportClientLogs)
}