package account

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)

func ClientRoutes(router *gin.RouterGroup) {
	var ctrler AccountControllerInterface = NewAccountController()
	router.GET("/", 
	middlewares.ValidatePermissions([]string{"Account.Read"}, true),
	ctrler.GetAccounts)
	router.GET("/:id",  ctrler.GetAccountById)
	router.GET("/stats",ctrler.GetAccountStats)
	router.PUT("/:id/profile-pictures", ctrler.UpdateProfilePicture)
	router.POST("/bulk", 
	middlewares.ValidatePermissions([]string{"Account.Add"}, true),
	 ctrler.ImportAccount)
	router.GET("/roles",
	middlewares.ValidatePermissions([]string{"Account.Read", "Role.Read"}, true),
	ctrler.GetAccountRoles)
	router.PATCH("/activation", 
	middlewares.ValidatePermissions([]string{"Account.Edit"}, true),
	ctrler.ActivateAccounts)
	router.PATCH("/deletion",
	middlewares.ValidatePermissions([]string{"Account.Edit"}, true),
	ctrler.DeleteAccounts)
	router.PATCH("/deactivation",
	middlewares.ValidatePermissions([]string{"Account.Edit"}, true),
	ctrler.DeactiveAccounts)
	router.PATCH("/restoration",
	middlewares.ValidatePermissions([]string{"Account.Edit"}, true),
	ctrler.RestoreAccounts)
	router.PUT("/bulk/activation",
	middlewares.ValidatePermissions([]string{"Account.Edit"}, true),
	ctrler.ActivateBulk)
}
