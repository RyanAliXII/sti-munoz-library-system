package reports

import "github.com/gin-gonic/gin"



func ReportRoutes(router * gin.RouterGroup) {
	ctrler := NewReportController()
	router.POST("/reports", ctrler.NewReport)
}