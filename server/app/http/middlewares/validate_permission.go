package middlewares

import (
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/acl"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func ValidatePermissions(requiredPermissions []string)gin.HandlerFunc{
	
	return func (ctx * gin.Context)  {
		id, hasId := ctx.Get("requestorId")
		if !hasId{
			logger.Error("Account id not found")
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		accountId, isString := id.(string)

		if !isString{
			logger.Error("Account id not string")
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		requestorApp, _ := ctx.Get("requestorApp")

		app, isAppString := requestorApp.(string)
		if !isAppString{
			logger.Error("Requestor app is not string.", slimlog.Function("middlewares.ValidatePermissions"))
			ctx.AbortWithStatus(http.StatusUnauthorized)
		}
		

		permissions, getAccountPermissionsErr := acl.GetPermissionsByAccountIdAndAppId(accountId, app)
		if len(permissions) == 0 {
			logger.Error("Account has no permissions.", zap.String("accountId", accountId))
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		if getAccountPermissionsErr != nil{
			logger.Error(getAccountPermissionsErr.Error())
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		for _, p := range requiredPermissions{
			_, accountHasPermission := permissions[p]
			if !accountHasPermission {
				logger.Error("Cannot proceed forbidden", zap.String("accountId", accountId))
				ctx.AbortWithStatus(http.StatusForbidden)
				return
			}
		}

		ctx.Next()
	}
}