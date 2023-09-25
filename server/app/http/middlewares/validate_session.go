package middlewares

import (
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)




func ValidateSession(ctx *gin.Context) {
	session := sessions.Default(ctx)
	sessionVal := session.Get("account")
	if(sessionVal == nil){
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	account := model.ScannerAccount{}
	err := account.Bind(sessionVal)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindAccountErr"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return 
	}
	ctx.Set("accountId", account.Id)
	ctx.Next()
}
