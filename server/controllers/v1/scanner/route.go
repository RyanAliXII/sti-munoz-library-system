package scanner

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

func ScannerAccountRoutes (router * gin.RouterGroup, services * services.Services){
	ctrler := NewScannerAccountController(services)

	router.POST("/",
	middlewares.ValidatePermissions([]string{"ScannerAccount.Add"}, true),
	middlewares.ValidateBody[NewAccountBody] ,ctrler.NewAccount)
	
	router.GET("/", 
	middlewares.ValidatePermissions([]string{"ScannerAccount.Read"}, true),
	ctrler.GeAccounts)
	
	router.PUT("/:id",
	middlewares.ValidatePermissions([]string{"ScannerAccount.Edit"}, true),
	middlewares.ValidateBody[UpdateAccountBody] ,ctrler.UpdateAccount)
	
	router.DELETE("/:id",
	middlewares.ValidatePermissions([]string{"ScannerAccount.Delete"}, false),
	ctrler.DeleteAccount )
}

func ScannerRoutes(router * gin.RouterGroup, services * services.Services){
	ctrler := NewScannerController(services)
	router.POST("/login", ctrler.Login)
	router.POST("/auth", ctrler.IsAuth)
	router.POST("/logs/clients/:clientId",middlewares.ValidateScannerToken,ctrler.LogClient)
	router.DELETE("/logout",middlewares.ValidateScannerToken,ctrler.Logout)
}