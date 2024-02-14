package middlewares

import (
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/permissionstore"
	"github.com/gin-gonic/gin"
)


func ValidatePermissions(permissions []string, blockRequestFromClientApp bool)gin.HandlerFunc{
	return func (ctx * gin.Context)  {
		requestorId := ctx.GetString("requestorId")
		requestorApp := ctx.GetString("requestorApp")
		requestorRole := ctx.GetString("requestorRole")
		if(requestorApp == azuread.ClientAppClientId ) {
			if(blockRequestFromClientApp){
				ctx.AbortWithStatus(http.StatusForbidden)
				return 
			}
			ctx.Next()
			return 
		}
		if requestorApp == azuread.AdminAppClientId{
			if requestorRole == "Root" {
				ctx.Next()
				return
			}
		}
		store  := permissionstore.GetPermissionStore()
		hasPermission := store.HasPermission(requestorId, permissions)
		if !hasPermission {
			ctx.AbortWithStatus(http.StatusForbidden)
			return 
		}
		ctx.Next()
	
	}
}