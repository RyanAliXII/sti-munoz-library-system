package scanner

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

func ScannerAccountRoutes (router * gin.RouterGroup, services * services.Services){
	ctrler := NewScannerAccountController(services)

	router.POST("/",
	services.PermissionValidator.Validate([]string{"ScannerAccount.Add"}, true),
	middlewares.ValidateBody[NewAccountBody] ,ctrler.NewAccount)
	
	router.GET("/", 
	services.PermissionValidator.Validate([]string{"ScannerAccount.Read"}, true),
	ctrler.GeAccounts)
	
	router.PUT("/:id",
	services.PermissionValidator.Validate([]string{"ScannerAccount.Edit"}, true),
	middlewares.ValidateBody[UpdateAccountBody] ,ctrler.UpdateAccount)
	
	router.DELETE("/:id",
	services.PermissionValidator.Validate([]string{"ScannerAccount.Delete"}, false),
	ctrler.DeleteAccount )
}

func ScannerRoutes(router * gin.RouterGroup, services * services.Services){
	ctrler := NewScannerController(services)
	router.POST("/login", ctrler.Login)
	router.POST("/auth", ctrler.IsAuth)
	router.POST("/logs/clients/:clientId",services.TokenValidator.ValidateScannerToken,ctrler.LogClient)
	router.DELETE("/logout",services.TokenValidator.ValidateScannerToken,ctrler.Logout)
	router.GET("/inquire-account", ctrler.InquireAccount)
}