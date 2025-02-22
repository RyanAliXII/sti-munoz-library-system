package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"
)


func BlockRequestFromClientApp(adminAppClientId string) func(ctx * gin.Context) {
	return func  (ctx * gin.Context)  {
		requestorApp := ctx.GetString("requestorApp")
		if requestorApp == adminAppClientId{
			ctx.Next()
			return
		}
		ctx.AbortWithStatus(http.StatusUnauthorized)
	}
	
}