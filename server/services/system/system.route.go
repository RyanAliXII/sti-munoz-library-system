package system

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func SystemRoutes(router *gin.RouterGroup) {
	ctrler := NewSystemConctroller()
	router.GET("/modules", middlewares.ValidateToken, ctrler.GetModules)
	router.POST("/roles", middlewares.ValidateToken, middlewares.ValidateBody[RoleBody], ctrler.CreateRole)
	router.PUT("/roles/:id",middlewares.ValidateToken, middlewares.ValidateBody[RoleBody], ctrler.UpdateRole)
	router.POST("/roles/accounts",middlewares.ValidateToken, middlewares.ValidateBody[AssignBody], ctrler.AssignRole)

	router.GET("/roles/accounts",
	middlewares.ValidatePermissions([]string{"AccessControl.Role.Read"}),
	ctrler.GetAccountRoles)

	router.DELETE("/roles/:id/accounts/:accountId",
	middlewares.ValidatePermissions([]string{"AccessControl.Role.Delete"}),
	ctrler.RemoveRoleAssignment,
	)
	router.GET("/roles",middlewares.ValidateToken, ctrler.GetRoles)
	router.POST("/accounts/verification",middlewares.ValidateToken, middlewares.ValidateBody[AccountBody] ,ctrler.VerifyAccount)
	router.POST("/accounts/permissions",middlewares.ValidateToken, ctrler.GetAccountRoleAndPermissions)
	router.GET("/settings", middlewares.ValidateToken, ctrler.GetAppSettings)
}
