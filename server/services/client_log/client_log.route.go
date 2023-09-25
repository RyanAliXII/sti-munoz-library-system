package clientlog

import "github.com/gin-gonic/gin"


func ClientLogRoutes (router * gin.RouterGroup){
	ctrler := NewClientLogController()
	router.GET("/", ctrler.GetClientLogs)
}