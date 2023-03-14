package middlewares

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"go.uber.org/zap"

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
	parser := jwt.NewParser()
	claims := jwt.MapClaims{}
	accessToken := authorizationHeader[1]
	_,_, parseClaimsUnverifiedErr := parser.ParseUnverified(accessToken, claims )

	if parseClaimsUnverifiedErr != nil{
		logger.Error(parseClaimsUnverifiedErr.Error(), slimlog.Function("middlewares.ValidateToken"), slimlog.Error("parseClaimsUnverified"))
	}
	aud, hasAUDClaim := claims["aud"].(string)
	if !hasAUDClaim {
		logger.Error("token has no aud claim.", slimlog.Function("middlewares.ValidateToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	// if tokens come from library client application
	if aud == azuread.ClientAppClientId{
		fmt.Println("FROM CLIENT APP")
		err := processClientApplicationToken(accessToken, ctx)
		if err != nil {
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		ctx.Next()
		return
	}
	//if tokens come from library admin application
	if aud == azuread.AdminAppId{
		fmt.Println("FROM ADMIN APP")
		err := processAdminApplicationToken(accessToken, ctx)
		if err != nil {
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		ctx.Next()
		return 
	}
	logger.Error("Invalid aud cannot determine if requeast comes from client application or admin application.", zap.String("aud", aud))
	ctx.AbortWithStatus(http.StatusUnauthorized)

}


func processClientApplicationToken (token string, ctx * gin.Context) error{
	claims := jwt.MapClaims{}
	jwks := azuread.GetorCreateClientAppJWKSInstance()
	_, parseTokenErr := jwt.ParseWithClaims(token, &claims, jwks.Keyfunc)
	if parseTokenErr != nil {
		logger.Error(parseTokenErr.Error(), slimlog.Function("middlewares.ValidateToken.processClientApplicationToken"), slimlog.Error("parseTokenErr"))
		return parseTokenErr
	}
	id, hasId := claims["oid"]
	if !hasId {
		return fmt.Errorf("tokens claims does not contain oid claim. %s", token)
	}
	ctx.Set("requestorApp", azuread.ClientAppId)
	ctx.Set("requestorRole","")
	ctx.Set("requestorId", id)
	return nil
}

func processAdminApplicationToken(token string, ctx * gin.Context)error{
	claims := jwt.MapClaims{}
	jwks := azuread.GetorCreateAdminAppJWKSInstance()
	_, parseTokenErr := jwt.ParseWithClaims(token, &claims, jwks.Keyfunc)
	if parseTokenErr != nil {
		logger.Error(parseTokenErr.Error(), slimlog.Function("middlewares.ValidateToken.processAdminApplicationToken"), slimlog.Error("parseTokenErr"))
		return parseTokenErr
	}

	id, hasId := claims["oid"]
	roles, hasRoles := claims["roles"]
	if !hasId {
		return fmt.Errorf("tokens claims does not contain oid claim. %s", token)
	}
	// check if user has role assigned from azure ad.
	if hasRoles {
		var requestorRole string = ""
		roleArr, isRoleArray := roles.([]interface{})
		if isRoleArray {
			if len(roleArr) > 0 {
				val, isString := roleArr[0].(string)
				if isString {
					requestorRole = val
				}
			}
		
		}
		ctx.Set("requestorRole", requestorRole)
	}
	ctx.Set("requestorApp", azuread.AdminAppId)
	ctx.Set("requestorId", id)
	return nil

}