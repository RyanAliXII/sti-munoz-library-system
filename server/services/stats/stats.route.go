package stats

import (
	"github.com/gin-gonic/gin"
)





func StatsRoutes (router * gin.RouterGroup){
	ctrler := NewStatsController()
	router.GET("/", ctrler.GetLibraryStats)
}