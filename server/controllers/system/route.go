package system

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/gin-gonic/gin"
)

func SystemRoutes(router *gin.RouterGroup, services * services.Services) {
	ctrler := NewSystemConctroller(services)

	router.GET("/modules", 
	services.PermissionValidator.Validate([]string{"Role.Read"}, true),
	ctrler.GetModules)

	router.POST("/roles",   
	services.PermissionValidator.Validate([]string{"Role.Add"}, true),
	middlewares.ValidateBody[RoleBody], ctrler.CreateRole)
	
	router.PUT("/roles/:id",  
	services.PermissionValidator.Validate([]string{"Role.Edit"}, true),
	middlewares.ValidateBody[RoleBody], ctrler.UpdateRole)
	
	router.POST("/roles/accounts", 
	services.PermissionValidator.Validate([]string{"Role.Assign"}, true),
	middlewares.ValidateBody[AssignBody], 
	ctrler.AssignRole)

	router.GET("/roles/accounts",
	services.PermissionValidator.Validate([]string{"Role.Read"}, true),
	ctrler.GetAccountRoles)

	router.DELETE("/roles/:id/accounts/:accountId",
	services.PermissionValidator.Validate([]string{"Role.Delete"}, true),
	ctrler.RemoveRoleAssignment,
	)
	router.GET("/roles",
	services.PermissionValidator.Validate([]string{"Role.Read"}, true),
	ctrler.GetRoles)
	
	router.POST("/accounts/verification", middlewares.ValidateBody[AccountBody] ,ctrler.VerifyAccount)
	router.POST("/accounts/permissions", ctrler.GetAccountRoleAndPermissions)
	
	router.GET("/settings",
	services.PermissionValidator.Validate([]string{"Setting.Read"}, true),
	ctrler.GetAppSettings)

	router.PUT("/settings",
	services.PermissionValidator.Validate([]string{"Setting.Edit"}, true),
	ctrler.UpdateAppSettings)
}
