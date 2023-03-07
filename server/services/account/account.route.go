package account

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"

	"github.com/gin-gonic/gin"
)

func ClientRoutes(router *gin.RouterGroup) {
	var ctrler AccountControllerInterface = NewAccountController()
	router.GET("/", ctrler.GetAccounts)
	router.POST("/bulk", ctrler.ImportAccount)
	router.POST("/verification", middlewares.ValidateBody[AccountBody], ctrler.VerifyAccount)
}
