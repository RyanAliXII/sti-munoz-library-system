package account

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)

func ClientRoutes(router *gin.RouterGroup) {
	var ctrler AccountControllerInterface = NewAccountController()
	router.Use(middlewares.ValidatePermissions("Account.Access"))
	router.GET("/", 
	middlewares.BlockRequestFromClientApp,
	ctrler.GetAccounts)
	router.GET("/:id",ctrler.GetAccountById)
	router.PUT("/:id/profile-pictures", ctrler.UpdateProfilePicture)
	router.POST("/bulk", 
	middlewares.BlockRequestFromClientApp,
	 ctrler.ImportAccount)
	router.GET("/roles",
	middlewares.BlockRequestFromClientApp,
	ctrler.GetAccountRoles)
	router.PATCH("/activation", ctrler.ActivateAccounts)
	router.PATCH("/deletion", ctrler.DeleteAccounts)
	router.PATCH("/deactivation", ctrler.DeactiveAccounts)
	router.PATCH("/restoration", ctrler.RestoreAccounts)
	router.PUT("/bulk/activation", ctrler.ActivateBulk)
}
