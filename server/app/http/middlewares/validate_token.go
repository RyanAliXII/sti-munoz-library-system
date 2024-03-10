package middlewares

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
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

	/*
		Parse the token without verifying the signature.
		The signature will be verified after the validation of aud and appid claims.
		
	*/
	_,_, parseClaimsUnverifiedErr := parser.ParseUnverified(accessToken, claims)
	if parseClaimsUnverifiedErr != nil{
		logger.Error(parseClaimsUnverifiedErr.Error(), slimlog.Function("middlewares.ValidateToken"), slimlog.Error("parseClaimsUnverified"))
	}
	aud, hasAUDClaim := claims["aud"].(string)
	if !hasAUDClaim {
		logger.Error("token has no aud claim.", slimlog.Function("middlewares.ValidateToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	//if token audience is not for this app.
	if aud != azuread.AppId{
		 ctx.AbortWithStatus(http.StatusUnauthorized)
		 return
	}
	appid, hasAppIdClaim := claims["appid"].(string)
	if !hasAppIdClaim{
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return 
	}
	
	// if tokens come from library client application
	if appid == azuread.ClientAppClientId{
		err := processClientApplicationToken(accessToken, ctx)
		if err != nil {
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		ctx.Next()
		return
	}
	//if tokens come from library admin application
	if appid == azuread.AdminAppClientId{
		err := processAdminApplicationToken(accessToken, ctx)
		if err != nil {
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		ctx.Next()
		return 
	}
	logger.Error("Invalid aud cannot determine if request comes from client application or admin application.", zap.String("aud", aud), zap.String("token", accessToken))
	ctx.AbortWithStatus(http.StatusUnauthorized)

}


func processClientApplicationToken (token string, ctx * gin.Context) error{
	claims := jwt.MapClaims{}
	jwks := azuread.GetOrCreateJwksInstance()

	_, parseTokenErr := jwt.ParseWithClaims(token, &claims, jwks.Keyfunc)
	if parseTokenErr != nil {
		logger.Error(parseTokenErr.Error(), slimlog.Function("middlewares.ValidateToken.processClientApplicationToken"), slimlog.Error("parseTokenErr"))
		return parseTokenErr
	}
	id, hasId := claims["oid"]
	if !hasId {
		return fmt.Errorf("tokens claims does not contain oid claim. %s", token)
	}
	ctx.Set("requestorApp", azuread.ClientAppClientId)
	ctx.Set("requestorRole","")
	ctx.Set("requestorId", id)
	return nil
}

func processAdminApplicationToken(token string, ctx * gin.Context)error{
	claims := jwt.MapClaims{}
	jwks := azuread.GetOrCreateJwksInstance()

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
	ctx.Set("requestorApp", azuread.AdminAppClientId)
	ctx.Set("requestorId", id)
	return nil

}

var tokenRepo = repository.NewTokenRepository(postgresdb.GetOrCreateInstance())
func ValidateScannerToken(ctx * gin.Context){
	headerValue, hasAuthorizationHeader := ctx.Request.Header["Authorization"]
	if !hasAuthorizationHeader {
		logger.Error("No authorization header present.", slimlog.Function("ValidateScannerToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	authorizationHeader := strings.Split(headerValue[0], " ")
	if len(authorizationHeader) < 2 {
		logger.Error("The length of authorization header must be atleast 2 like Bearer ${accessToken} format.", slimlog.Function("ValidateScannerToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	secret := os.Getenv("JWT_SECRET")
	accessToken := authorizationHeader[1]

	token, err := jwt.Parse(accessToken, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("invalid signing method")
		}
		return []byte(secret), nil
	})
	if(err != nil){
		logger.Error(err.Error(), slimlog.Function("ValidateScannerToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if (!ok || !token.Valid) {
		logger.Error("Invalid claims", slimlog.Function("ValidateScannerToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	} 
	iss := os.Getenv("SERVER_URL")
	aud := os.Getenv("SCANNER_APP_URL")
	isAudOk := claims.VerifyAudience(aud, true)
	isIssuerOk := claims.VerifyIssuer(iss, true)
	jti := claims["jti"].(string)
	
	if !isAudOk || !isIssuerOk{
		logger.Error("claims do not match", slimlog.Function("ValidateScannerToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	} 
	t, err := tokenRepo.GetTokenByJTI(jti)
	if t.IsRevoked || err != nil {
		logger.Error("Token is revoked.", slimlog.Function("ValidateScannerToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	ctx.Set("accessToken", token.Raw)
	ctx.Set("jti", jti)
	ctx.Set("sub", claims["sub"])
	ctx.Next()

}