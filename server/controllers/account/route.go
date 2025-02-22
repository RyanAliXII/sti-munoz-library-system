package account

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

func ClientRoutes(router *gin.RouterGroup, services * services.Services) {
	ctrler := NewAccountController(services)
	router.GET("/", 
	services.PermissionValidator.Validate([]string{"Account.Read"}, true),
	ctrler.GetAccounts)
	router.GET("/:id",  ctrler.GetAccountById)
	router.GET("/stats",ctrler.GetAccountStats)
	router.PUT("/:id/profile-pictures", ctrler.UpdateProfilePicture)
	router.POST("/bulk", 
	services.PermissionValidator.Validate([]string{"Account.Add"}, true),
	 ctrler.ImportAccount)
	router.GET("/roles",
	services.PermissionValidator.Validate([]string{"Account.Read", "Role.Read"}, true),
	ctrler.GetAccountRoles)
	router.PATCH("/activation", 
	services.PermissionValidator.Validate([]string{"Account.Edit"}, true),
	ctrler.ActivateAccounts)
	router.PATCH("/deletion",
	services.PermissionValidator.Validate([]string{"Account.Edit"}, true),
	ctrler.DeleteAccounts)
	router.PATCH("/deactivation",
	services.PermissionValidator.Validate([]string{"Account.Edit"}, true),
	ctrler.DeactiveAccounts)
	router.PATCH("/restoration",
	services.PermissionValidator.Validate([]string{"Account.Edit"}, true),
	ctrler.RestoreAccounts)
	router.PUT("/bulk/activation",
	services.PermissionValidator.Validate([]string{"Account.Edit"}, true),
	ctrler.ActivateBulk)
}
