package middlewares

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/MicahParks/keyfunc"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/configmanager"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"

	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)
type TokenValidator struct {
	tokenRepo repository.TokenRepository
	logger * zap.Logger
	config * configmanager.Config
	jwks * keyfunc.JWKS
}
func NewTokenValidator(db * sqlx.DB, logger * zap.Logger, jwks *keyfunc.JWKS, config * configmanager.Config) TokenValidator{
	return TokenValidator{
		tokenRepo: repository.NewTokenRepository(db),
		logger: logger,
		jwks: jwks,
		config: config,
	}
}
func(tv * TokenValidator) ValidateToken(ctx *gin.Context) {
	headerValue, hasAuthorizationHeader := ctx.Request.Header["Authorization"]
	if !hasAuthorizationHeader {
		tv.logger.Error("No authorization header present.", applog.Function("middlewares.ValidateToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	authorizationHeader := strings.Split(headerValue[0], " ")

	if len(authorizationHeader) < 2 {
		tv.logger.Error("The length of authorization header must be atleast 2 like Bearer ${accessToken} format.", applog.Function("middlewares.ValidateToken"))
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
		tv.logger.Error(parseClaimsUnverifiedErr.Error(), applog.Function("middlewares.ValidateToken"), applog.Error("parseClaimsUnverified"))
	}
	aud, hasAUDClaim := claims["aud"].(string)
	if !hasAUDClaim {
		tv.logger.Error("token has no aud claim.", applog.Function("middlewares.ValidateToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	var audienceClaim = fmt.Sprintf("api://%s",  tv.config.APIAppID)
	//if token audience is not for this app.
	if aud != audienceClaim{
		 ctx.AbortWithStatus(http.StatusUnauthorized)
		 return
	}
	appid, hasAppIdClaim := claims["appid"].(string)
	if !hasAppIdClaim{
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return 
	}
	
	// if tokens come from library client application
	if appid == tv.config.ClientAppClientID{
		err := tv.processClientApplicationToken(accessToken, ctx)
		if err != nil {
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		ctx.Next()
		return
	}
	//if tokens come from library admin application
	if appid == tv.config.AdminAppClientID{
		err := tv.processAdminApplicationToken(accessToken, ctx)
		if err != nil {
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		ctx.Next()
		return 
	}
	tv.logger.Error("Invalid aud cannot determine if request comes from client application or admin application.", zap.String("aud", aud), zap.String("token", accessToken))
	ctx.AbortWithStatus(http.StatusUnauthorized)

}


func(tv *TokenValidator) processClientApplicationToken (token string, ctx * gin.Context) error{
	claims := jwt.MapClaims{}
	_, parseTokenErr := jwt.ParseWithClaims(token, &claims, tv.jwks.Keyfunc)
	if parseTokenErr != nil {
		tv.logger.Error(parseTokenErr.Error(), applog.Function("middlewares.ValidateToken.processClientApplicationToken"), applog.Error("parseTokenErr"))
		return parseTokenErr
	}
	id, hasId := claims["oid"]
	if !hasId {
		return fmt.Errorf("tokens claims does not contain oid claim. %s", token)
	}
	ctx.Set("requestorApp", tv.config.ClientAppClientID)
	ctx.Set("requestorRole","")
	ctx.Set("requestorId", id)
	return nil
}

func(tv * TokenValidator) processAdminApplicationToken(token string, ctx * gin.Context)error{
	claims := jwt.MapClaims{}
	_, parseTokenErr := jwt.ParseWithClaims(token, &claims, tv.jwks.Keyfunc)
	if parseTokenErr != nil {
		tv.logger.Error(parseTokenErr.Error(), applog.Function("middlewares.ValidateToken.processAdminApplicationToken"), applog.Error("parseTokenErr"))
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
	ctx.Set("requestorApp", tv.config.AdminAppClientID)
	ctx.Set("requestorId", id)
	return nil

}


func(tv * TokenValidator) ValidateScannerToken(ctx * gin.Context){
	
	headerValue, hasAuthorizationHeader := ctx.Request.Header["Authorization"]
	if !hasAuthorizationHeader {
		tv.logger.Error("No authorization header present.", applog.Function("ValidateScannerToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	authorizationHeader := strings.Split(headerValue[0], " ")
	if len(authorizationHeader) < 2 {
		tv.logger.Error("The length of authorization header must be atleast 2 like Bearer ${accessToken} format.", applog.Function("ValidateScannerToken"))
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
		tv.logger.Error(err.Error(), applog.Function("ValidateScannerToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if (!ok || !token.Valid) {
		tv.logger.Error("Invalid claims", applog.Function("ValidateScannerToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	} 
	iss := os.Getenv("SERVER_URL")
	aud := os.Getenv("SCANNER_APP_URL")
	isAudOk := claims.VerifyAudience(aud, true)
	isIssuerOk := claims.VerifyIssuer(iss, true)
	jti := claims["jti"].(string)
	
	if !isAudOk || !isIssuerOk{
		tv.logger.Error("claims do not match", applog.Function("ValidateScannerToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	} 
	t, err := tv.tokenRepo.GetTokenByJTI(jti)
	if t.IsRevoked || err != nil {
		tv.logger.Error("Token is revoked.", applog.Function("ValidateScannerToken"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	ctx.Set("accessToken", token.Raw)
	ctx.Set("jti", jti)
	ctx.Set("sub", claims["sub"])
	ctx.Next()

}