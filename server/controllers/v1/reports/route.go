package reports

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)



func ReportRoutes(router * gin.RouterGroup, services * services.Services) {
	ctrler := NewReportController(services)
	router.POST("", ctrler.NewReport)
}

func ReportRendererRoutes(router * gin.RouterGroup, services * services.Services){
	ctrler := NewReportController(services)
	router.GET("/reports", ctrler.RenderReport)
	router.GET("/reports/audits/:auditId", ctrler.RenderAuditReport)
}