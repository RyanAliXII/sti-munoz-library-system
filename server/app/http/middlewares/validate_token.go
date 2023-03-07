package middlewares

import (
	"net/http"
	"strings"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"

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
		logger.Error(parseTokenErr.Error(), slimlog.Function("middlewares.ValidateToken"), slimlog.Error("parseTokenErr"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	aud, hasAUDClaim := claims["aud"].(string)
	if !hasAUDClaim || aud != azuread.APP_ID {
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	id, hasId := claims["oid"]
	roles, hasRoles := claims["roles"]
	if !hasId {
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	if hasRoles {
		var requestorRole string = ""
		//cant  typecast array of interface to array of string, this will be good for now
		roleArr, isRoleArray := roles.([]interface{})
		if isRoleArray {
			for _, r := range roleArr {
				val, isString := r.(string)
				// run first loop only
				if isString {
					requestorRole = val
					break
				}

			}

		}
		ctx.Set("requestorRole", requestorRole)
	}
	ctx.Set("requestorId", id)

}
