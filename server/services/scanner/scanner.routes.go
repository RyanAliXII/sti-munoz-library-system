package scanner

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)

func ScannerAccountRoutes (router * gin.RouterGroup){
	ctrler := NewScannerAccountController()
	router.POST("/",middlewares.ValidateBody[NewAccountBody] ,ctrler.NewAccount)
	router.GET("/", ctrler.GeAccounts)
	router.PUT("/:id",middlewares.ValidateBody[UpdateAccountBody] ,ctrler.UpdateAccount)
}