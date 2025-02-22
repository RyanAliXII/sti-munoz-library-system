package scanner

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
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
}
func(ctrler * Scanner) Login (ctx * gin.Context){
	body := LoginBody{}
	err := ctx.BindJSON(&body)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid username or password."))
		return
	}
	account, err := ctrler.services.Repos.ScannerAccount.GetAccountByUsername(body.Username)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("GetAccountByUsernameErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid username or password."))
		return
	}
	err = bcrypt.CompareHashAndPassword([]byte(account.Password), []byte(body.Password))
	if err != nil {
		ctx.JSON(httpresp.Fail400(nil, "Invalid username or password."))
		return
	}
	jti := uuid.NewString()

	secret := ctrler.services.Config.JWTSecret
	iss := ctrler.services.Config.ServerURL;
	aud := ctrler.services.Config.ScannerAppURL
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
		ctrler.services.Logger.Error(err.Error(), zap.String("error", "tokenSigning" ))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	err = ctrler.services.Repos.TokenRepository.NewToken(model.Token{
		Id: jti,
		Value: tokenStr,
	})
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), zap.String("error", "tokenSavin" ))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"accessToken": tokenStr,
	}, "Ok") )
}
func(ctrler * Scanner) IsAuth (ctx * gin.Context){
	headerValue, hasAuthorizationHeader := ctx.Request.Header["Authorization"]
	if !hasAuthorizationHeader {
		ctrler.services.Logger.Error("No authorization header present.", applog.Function("IsAuth"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	authorizationHeader := strings.Split(headerValue[0], " ")
	if len(authorizationHeader) < 2 {
		ctrler.services.Logger.Error("The length of authorization header must be atleast 2 like Bearer ${accessToken} format.", applog.Function("IsAuth"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	secret := ctrler.services.Config.JWTSecret
	accessToken := authorizationHeader[1]

	token, err := jwt.Parse(accessToken, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("invalid signing method")
		}
		return []byte(secret), nil
	})
	if(err != nil){
		ctrler.services.Logger.Error(err.Error(), applog.Function("IsAuth"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if (!ok || !token.Valid) {
		ctrler.services.Logger.Error("Invalid claims", applog.Function("IsAuth"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	} 
	iss := ctrler.services.Config.ServerURL;
	aud := ctrler.services.Config.ScannerAppURL;
	isAudOk := claims.VerifyAudience(aud, true)
	isIssuerOk := claims.VerifyIssuer(iss, true)
	jti := claims["jti"].(string)
	
	if !isAudOk || !isIssuerOk{
		ctrler.services.Logger.Error("claims do not match", applog.Function("IsAuth"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	} 
	t, err := ctrler.services.Repos.TokenRepository.GetTokenByJTI(jti)
	if t.IsRevoked || err != nil {
		ctrler.services.Logger.Error("Token is revoked.", applog.Function("IsAuth"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Ok") )
}
func(ctrler * Scanner) LogClient (ctx * gin.Context){
	clientId := ctx.Param("clientId")
	scannerId := ctx.GetString("sub")
	account, err := ctrler.services.Repos.AccountRepository.GetAccountById(clientId)
	if err != nil {
		if(err == sql.ErrNoRows){
			 ctx.JSON(httpresp.Fail404(nil, "Account not found"))
			 return
		}
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}

	err = ctrler.services.Repos.ClientLogRepository.NewLog(clientId, scannerId)
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
		ctx.JSON(httpresp.Fail400(nil,"Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"client": account,
	}, "Ok") )
}

func(ctrler * Scanner) Logout (ctx * gin.Context){
	jti := ctx.GetString("jti")
	err := ctrler.services.Repos.TokenRepository.RevokeToken(jti) 
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), zap.String("error", "RevokeErr"))
		ctx.JSON(httpresp.Fail(http.StatusInternalServerError, nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Ok") )
}
func (ctrler * Scanner)InquireAccount(ctx * gin.Context){
	input := ctx.Query("input")
		input  = strings.TrimSpace(input)
		if len(input) == 0{
			ctx.JSON(httpresp.Fail404(nil, "Not found."))
			return
		}
		account, err := ctrler.services.Repos.AccountRepository.GetAccountByStudentNumberOrEmail(input)
		if err != nil {
			ctrler.services.Logger.Info(err.Error())
			if(err != sql.ErrNoRows){
				ctrler.services.Logger.Info(err.Error())
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