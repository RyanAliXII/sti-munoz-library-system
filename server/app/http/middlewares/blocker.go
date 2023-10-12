package middlewares

import (
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/gin-gonic/gin"
)





func BlockRequestFromClientApp(ctx * gin.Context) {
	requestorApp := ctx.GetString("requestorApp")
	if requestorApp == azuread.ClientAppClientId{
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	if requestorApp == azuread.AdminAppClientId{
		ctx.Next()
		return
	}

	ctx.AbortWithStatus(http.StatusUnauthorized)
}