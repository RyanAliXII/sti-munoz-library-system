package routes

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/printables"
	"github.com/gin-gonic/gin"
)


func Register(r * gin.Engine){
	printables.RegisterPrintablesGeneratorRoutes(r.Group("/printables-generator"))
	printables.RegisterPrintablesRoutes(r.Group("/printables"))
}