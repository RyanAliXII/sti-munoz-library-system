package middlewares

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

	"github.com/gin-gonic/gin"
)

var accountRepo = repository.NewAccountRepository()
func ValidatePermissions(requiredPermission string)gin.HandlerFunc{
	return func (ctx * gin.Context)  {
		ctx.Next()
		// requestorId := ctx.GetString("requestorId")
		// requestorApp := ctx.GetString("requestorApp")
		// requestorRole := ctx.GetString("requestorRole")

		// if requestorApp == azuread.AdminAppClientId{
		// 	if requestorRole == "Root" {
		// 		permissions := acl.GetRootUserPermissions()
		// 		if (permissions.HasPermission(requiredPermission)){
		// 			ctx.Next()
		// 			return
		// 		}
		// 		logger.Error("Unauthorize permission not found.")
		// 		ctx.AbortWithStatus(http.StatusUnauthorized)
		// 		return 
		// 	}
		// 	ctx.Next()
		// 	// dbRole, err := accountRepo.GetRoleByAccountId(requestorId)
		// 	// if err != nil {
		// 	// 	ctx.AbortWithStatus(http.StatusUnauthorized)
		// 	// 	logger.Error(err.Error(), slimlog.Error("accountRepo.GetRoleByAccountId"))
		// 	// 	return
		// 	// }
		// 	// permissions := dbRole.Permissions.ExtractValues()
		// 	// if(permissions.HasPermission(requiredPermission)){
		// 	// 	ctx.Next()
		// 	// 	return 
		// 	// }
		// 	// logger.Error("Unauthorize permission not found.")
		// 	// ctx.AbortWithStatus(http.StatusUnauthorized)
		// 	// return 
		// }
		// if requestorApp == azuread.ClientAppClientId{
		// 	ctx.Next()
		// 	return
		// }

		// logger.Error("Unknown Application Client Id")
		// ctx.AbortWithStatus(http.StatusUnauthorized)
	}
}