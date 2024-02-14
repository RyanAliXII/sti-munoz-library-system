package reports

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)



func ReportRoutes(router * gin.RouterGroup) {
	ctrler := NewReportController()
	router.POST("", ctrler.NewReport)
}

func ReportRendererRoutes(router * gin.RouterGroup){
	ctrler := NewReportController()
	router.Use(middlewares.ValidatePermissions([]string{"Report.Read"}, true))
	router.GET("/reports", ctrler.RenderReport)
	router.GET("/reports/audits/:auditId", ctrler.RenderAuditReport)
}