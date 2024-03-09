package routes

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/printables"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/reports"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/scanner"
	"github.com/gin-gonic/gin"
)


func Register(r * gin.Engine){
	printables.RegisterPrintablesGeneratorRoutes(r.Group("/printables-generator"))
	printables.RegisterPrintablesRoutes(r.Group("/printables"))
	reports.ReportRendererRoutes(r.Group("/renderer"))
	scanner.ScannerRoutes(r.Group("/scanner/"))
}