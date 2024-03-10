package clientlog

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)


func ClientLogRoutes (router * gin.RouterGroup, services * services.Services){
	ctrler := NewClientLogController(services)
	router.GET("/",
	middlewares.ValidatePermissions([]string{"PatronLog.Read"}, true),
	ctrler.GetClientLogs)
}