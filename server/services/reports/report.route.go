package reports

import "github.com/gin-gonic/gin"



func ReportRoutes(router * gin.RouterGroup) {
	ctrler := NewReportController()
	router.POST("", ctrler.NewReport)
}

func ReportRendererRoutes(router * gin.RouterGroup){
	ctrler := NewReportController()
	router.GET("/reports", ctrler.RenderReport)
}