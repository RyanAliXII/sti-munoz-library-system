package scanner

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)

func ScannerAccountRoutes (router * gin.RouterGroup){
	ctrler := NewScannerAccountController()
	router.Use(middlewares.ValidatePermissions("ScannerAccount.Access"))
	router.Use(middlewares.BlockRequestFromClientApp)
	router.POST("/",middlewares.ValidateBody[NewAccountBody] ,ctrler.NewAccount)
	router.GET("/", ctrler.GeAccounts)
	router.PUT("/:id",middlewares.ValidateBody[UpdateAccountBody] ,ctrler.UpdateAccount)
	router.DELETE("/:id",ctrler.DeleteAccount )
}

func ScannerRoutes(router * gin.RouterGroup){
	ctrler := NewScannerController()
	router.POST("/login", ctrler.Login)
	router.POST("/auth", ctrler.IsAuth)
	router.POST("/logs/clients/:clientId",middlewares.ValidateScannerToken,ctrler.LogClient)
	router.DELETE("/logout",middlewares.ValidateScannerToken,ctrler.Logout)
}