package scanner

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)


type ScannerController interface {
	Login (ctx * gin.Context)
	IsAuth (ctx * gin.Context)
	LogClient (ctx * gin.Context)
	Logout (ctx * gin.Context)
	InquireAccount(ctx * gin.Context)
}

type Scanner struct {
	services * services.Services
	// ScannerAccountRepo repository.ScannerAccountRepository
	// ClientLogRepo repository.ClientLogRepository
	// accountRepo repository.AccountRepositoryInterface
	// tokenRepo repository.TokenRepository

}
func(c * Scanner) Login (ctx * gin.Context){
	body := LoginBody{}
	err := ctx.BindJSON(&body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid username or password."))
		return
	}
	account, err := c.services.Repos.ScannerAccount.GetAccountByUsername(body.Username)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetAccountByUsernameErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid username or password."))
		return
	}
	err = bcrypt.CompareHashAndPassword([]byte(account.Password), []byte(body.Password))
	if err != nil {
		ctx.JSON(httpresp.Fail400(nil, "Invalid username or password."))
		return
	}
	jti := uuid.NewString()

	secret := os.Getenv("JWT_SECRET")
	iss := os.Getenv("SERVER_URL")
	aud := os.Getenv("SCANNER_APP_URL")
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"iss": iss,
		"aud": aud,
		"sub": account.Id,
		"exp": time.Now().Add(time.Hour * 16).Unix(),
		"iat": time.Now().Unix(),
		"jti": jti,
	})
	tokenStr, err := token.SignedString([]byte(secret))	
	if err != nil {
		logger.Error(err.Error(), zap.String("error", "tokenSigning" ))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	err = c.services.Repos.TokenRepository.NewToken(model.Token{
		Id: jti,
		Value: tokenStr,
	})
	if err != nil {
		logger.Error(err.Error(), zap.String("error", "tokenSavin" ))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"accessToken": tokenStr,
	}, "Ok") )
}
func(c * Scanner) IsAuth (ctx * gin.Context){
	headerValue, hasAuthorizationHeader := ctx.Request.Header["Authorization"]
	if !hasAuthorizationHeader {
		logger.Error("No authorization header present.", slimlog.Function("IsAuth"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	authorizationHeader := strings.Split(headerValue[0], " ")
	if len(authorizationHeader) < 2 {
		logger.Error("The length of authorization header must be atleast 2 like Bearer ${accessToken} format.", slimlog.Function("IsAuth"))
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
		logger.Error(err.Error(), slimlog.Function("IsAuth"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if (!ok || !token.Valid) {
		logger.Error("Invalid claims", slimlog.Function("IsAuth"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	} 
	iss := os.Getenv("SERVER_URL")
	aud := os.Getenv("SCANNER_APP_URL")
	isAudOk := claims.VerifyAudience(aud, true)
	isIssuerOk := claims.VerifyIssuer(iss, true)
	jti := claims["jti"].(string)
	
	if !isAudOk || !isIssuerOk{
		logger.Error("claims do not match", slimlog.Function("IsAuth"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	} 
	t, err := c.services.Repos.TokenRepository.GetTokenByJTI(jti)
	if t.IsRevoked || err != nil {
		logger.Error("Token is revoked.", slimlog.Function("IsAuth"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Ok") )
}
func(c * Scanner) LogClient (ctx * gin.Context){
	clientId := ctx.Param("clientId")
	scannerId := ctx.GetString("sub")
	account, err := c.services.Repos.AccountRepository.GetAccountById(clientId)
	if err != nil {
		if(err == sql.ErrNoRows){
			 ctx.JSON(httpresp.Fail404(nil, "Account not found"))
			 return
		}
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}

	err = c.services.Repos.ClientLogRepository.NewLog(clientId, scannerId)
	if err != nil {
		logger.Error(err.Error())
		ctx.JSON(httpresp.Fail400(nil,"Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"client": account,
	}, "Ok") )
}

func(c * Scanner) Logout (ctx * gin.Context){
	jti := ctx.GetString("jti")
	err := c.services.Repos.TokenRepository.RevokeToken(jti) 
	if err != nil {
		logger.Error(err.Error(), zap.String("error", "RevokeErr"))
		ctx.JSON(httpresp.Fail(http.StatusInternalServerError, nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Ok") )
}
func (c * Scanner)InquireAccount(ctx * gin.Context){
	input := ctx.Query("input")
		input  = strings.TrimSpace(input)
		if len(input) == 0{
			ctx.JSON(httpresp.Fail404(nil, "Not found."))
			return
		}
		account, err := c.services.Repos.AccountRepository.GetAccountByStudentNumberOrEmail(input)
		if err != nil {
			c.services.Logger.Info(err.Error())
			if(err != sql.ErrNoRows){
				c.services.Logger.Info(err.Error())
			}
			ctx.JSON(httpresp.Fail404(nil, "Not found."))
			return
		}
	
		ctx.JSON(httpresp.Success200(gin.H{
			"account" : gin.H{
				"id": account.Id,
				"givenName" : account.GivenName,
				"surname": account.Surname,
			},
		}, "Account fetchted."))
}



func NewScannerController (services * services.Services) ScannerController{
	return &Scanner{
		services: services,
	}
}