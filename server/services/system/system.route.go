package system

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func SystemRoutes(router *gin.RouterGroup) {
	ctrler := NewSystemConctroller()

	router.GET("/modules", 
	middlewares.ValidatePermissions([]string{"Role.Read"}, true),
	ctrler.GetModules)

	router.POST("/roles",   
	middlewares.ValidatePermissions([]string{"Role.Add"}, true),
	middlewares.ValidateBody[RoleBody], ctrler.CreateRole)
	
	router.PUT("/roles/:id",  
	middlewares.ValidatePermissions([]string{"Role.Edit"}, true),
	middlewares.ValidateBody[RoleBody], ctrler.UpdateRole)
	
	router.POST("/roles/accounts", 
	middlewares.ValidatePermissions([]string{"Role.Assign"}, true),
	middlewares.ValidateBody[AssignBody], 
	ctrler.AssignRole)

	router.GET("/roles/accounts",
	middlewares.ValidatePermissions([]string{"Role.Read"}, true),
	ctrler.GetAccountRoles)

	router.DELETE("/roles/:id/accounts/:accountId",
	middlewares.ValidatePermissions([]string{"Role.Delete"}, true),
	ctrler.RemoveRoleAssignment,
	)
	router.GET("/roles",
	middlewares.ValidatePermissions([]string{"Role.Read"}, true),
	ctrler.GetRoles)
	
	router.POST("/accounts/verification", middlewares.ValidateBody[AccountBody] ,ctrler.VerifyAccount)
	router.POST("/accounts/permissions", ctrler.GetAccountRoleAndPermissions)
	
	router.GET("/settings",
	middlewares.ValidatePermissions([]string{"Setting.Read"}, true),
	ctrler.GetAppSettings)

	router.PUT("/settings",
	middlewares.ValidatePermissions([]string{"Setting.Edit"}, true),
	ctrler.UpdateAppSettings)
}
