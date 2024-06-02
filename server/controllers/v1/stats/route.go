package stats

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

func StatsRoutes (router * gin.RouterGroup, services * services.Services){
	ctrler := NewStatsController(services)
	router.GET("/", middlewares.BlockRequestFromClientApp, ctrler.GetLibraryStats)
}