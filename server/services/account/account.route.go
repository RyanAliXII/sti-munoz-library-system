package account

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)

func ClientRoutes(router *gin.RouterGroup) {
	var ctrler AccountControllerInterface = NewAccountController()
	router.GET("/", ctrler.GetAccounts)
	router.GET("/:id",middlewares.ValidateToken,ctrler.GetAccountById)
	router.POST("/bulk", ctrler.ImportAccount)
	router.GET("/roles",
	middlewares.ValidatePermissions([]string{"AccessControl.Role.Read"}),
	ctrler.GetAccountRoles)
}
