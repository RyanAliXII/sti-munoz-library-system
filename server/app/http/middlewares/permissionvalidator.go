package middlewares

import (
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/configmanager"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/permissionstore"
	"github.com/gin-gonic/gin"
)

type PermissionValidator struct {
	store  permissionstore.PermissionStore
	config * configmanager.Config
}
func NewPermissionValidator(store  permissionstore.PermissionStore, config * configmanager.Config)PermissionValidator{
	return PermissionValidator{
		store: store,
		config:  config,
	}
}
func (pv * PermissionValidator) Validate(permissions []string, blockRequestFromClientApp bool)gin.HandlerFunc{
	return func (ctx * gin.Context)  {
		requestorId := ctx.GetString("requestorId")
		requestorApp := ctx.GetString("requestorApp")
		requestorRole := ctx.GetString("requestorRole")
		if(requestorApp == pv.config.ClientAppClientID ) {
			if(blockRequestFromClientApp){
				ctx.AbortWithStatus(http.StatusForbidden)
				return 
			}
			ctx.Next()
			return 
		}
		if requestorApp == pv.config.AdminAppClientID{
			if requestorRole == "Root" {
				ctx.Next()
				return
			}
		}
		
		hasPermission := pv.store.HasPermission(requestorId, permissions)
		if !hasPermission {
			ctx.AbortWithStatus(http.StatusForbidden)
			return 
		}
		ctx.Next()
	
	}
}