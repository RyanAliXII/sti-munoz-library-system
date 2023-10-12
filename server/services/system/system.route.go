package system

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func SystemRoutes(router *gin.RouterGroup) {
	ctrler := NewSystemConctroller()

	router.GET("/modules", 
	middlewares.ValidatePermissions("ACL.Access"),  
	middlewares.BlockRequestFromClientApp,
	ctrler.GetModules)
	router.POST("/roles",   
	middlewares.ValidatePermissions("ACL.Access"), 
	middlewares.BlockRequestFromClientApp,
	middlewares.ValidateBody[RoleBody], ctrler.CreateRole)
	
	router.PUT("/roles/:id",  
	middlewares.ValidatePermissions("ACL.Access"), 
	middlewares.BlockRequestFromClientApp,
	middlewares.ValidateBody[RoleBody], ctrler.UpdateRole)
	
	router.POST("/roles/accounts", 
	middlewares.ValidatePermissions("ACL.Access"), 
	middlewares.BlockRequestFromClientApp,
	middlewares.ValidateBody[AssignBody], 
	ctrler.AssignRole)

	router.GET("/roles/accounts",
	middlewares.ValidatePermissions("ACL.Access"),
	middlewares.BlockRequestFromClientApp,
	ctrler.GetAccountRoles)
	router.DELETE("/roles/:id/accounts/:accountId",
	middlewares.ValidatePermissions("ACL.Access"),
	middlewares.BlockRequestFromClientApp,
	ctrler.RemoveRoleAssignment,
	)
	router.GET("/roles",
	middlewares.ValidatePermissions("ACL.Access"),
	middlewares.BlockRequestFromClientApp,
	ctrler.GetRoles)
	
	router.POST("/accounts/verification", middlewares.ValidateBody[AccountBody] ,ctrler.VerifyAccount)
	router.POST("/accounts/permissions", ctrler.GetAccountRoleAndPermissions)
	
	router.GET("/settings",
	middlewares.ValidatePermissions("Settings.Access"),
	middlewares.BlockRequestFromClientApp, ctrler.GetAppSettings)
}
