package stats

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)

func StatsRoutes (router * gin.RouterGroup){
	ctrler := NewStatsController()
	router.GET("/", middlewares.BlockRequestFromClientApp, ctrler.GetLibraryStats)
}