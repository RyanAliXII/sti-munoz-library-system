package reports

import "github.com/gin-gonic/gin"


type Report struct {}

type ReportController interface {
	NewReport(ctx * gin.Context)
}
func NewReportController () ReportController {
	return &Report{}
}
func(ctrler * Report)NewReport(ctx * gin.Context){
	
}