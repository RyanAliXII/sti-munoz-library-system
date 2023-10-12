package system

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func SystemRoutes(router *gin.RouterGroup) {
	ctrler := NewSystemConctroller()
	router.GET("/modules",  ctrler.GetModules)
	router.POST("/roles",  middlewares.ValidateBody[RoleBody], ctrler.CreateRole)
	router.PUT("/roles/:id", middlewares.ValidateBody[RoleBody], ctrler.UpdateRole)
	router.POST("/roles/accounts", middlewares.ValidateBody[AssignBody], ctrler.AssignRole)

	router.GET("/roles/accounts",
	ctrler.GetAccountRoles)
	router.DELETE("/roles/:id/accounts/:accountId",
	ctrler.RemoveRoleAssignment,
	)
	router.GET("/roles", ctrler.GetRoles)
	router.POST("/accounts/verification", middlewares.ValidateBody[AccountBody] ,ctrler.VerifyAccount)
	router.POST("/accounts/permissions", ctrler.GetAccountRoleAndPermissions)
	router.GET("/settings",  ctrler.GetAppSettings)
}
