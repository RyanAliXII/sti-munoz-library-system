package middlewares

import (
	"fmt"
	"net/http"
	"slim-app/server/app/pkg/azuread"
	"slim-app/server/app/pkg/slimlog"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

func ValidateToken(ctx *gin.Context) {
	headerValue, hasAuthorizationHeader := ctx.Request.Header["Authorization"]
	if !hasAuthorizationHeader {
		logger.Error("No authorization header present.", slimlog.Function("middlewares.ValidateToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	authorizationHeader := strings.Split(headerValue[0], " ")

	if len(authorizationHeader) < 2 {
		logger.Error("The length of authorization header must be atleast 2 like Bearer ${accessToken} format.", slimlog.Function("middlewares.ValidateToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	accessToken := authorizationHeader[1]
	claims := jwt.MapClaims{}
	jwks := azuread.GetorCreateJWKSInstance()
	_, parseTokenErr := jwt.ParseWithClaims(accessToken, &claims, jwks.Keyfunc)
	if parseTokenErr != nil {
		logger.Error(parseTokenErr.Error(), slimlog.Function("middlewares.ValidateToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	aud, hasAUDClaim := claims["aud"].(string)

	if !hasAUDClaim {
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	if aud != azuread.APP_ID {
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	for key, value := range claims {
		fmt.Printf("%s %v \n", key, value)
	}
	ctx.Next()
}
