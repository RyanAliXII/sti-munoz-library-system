package clientlog

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)


func ClientLogRoutes (router * gin.RouterGroup){
	ctrler := NewClientLogController()
	router.GET("/",
	middlewares.ValidatePermissions([]string{"PatronLog.Read"}, true),
	ctrler.GetClientLogs)
}