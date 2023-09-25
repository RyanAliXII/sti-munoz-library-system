package scanner

import (
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)


type ScannerController interface {
	Login (ctx * gin.Context)
	IsAuth (ctx * gin.Context)
}

type Scanner struct {
	ScannerAccountRepo repository.ScannerAccountRepository

}
func(c * Scanner) Login (ctx * gin.Context){
	body := LoginBody{}
	err := ctx.BindJSON(&body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid username or password."))
		return
	}
	account, err := c.ScannerAccountRepo.GetAccountByUsername(body.Username)
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
	session := sessions.Default(ctx)
	accountBytes, err := account.ToBytes()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("ToBytesErr"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid username or password."))
		return
	}
	session.Set("account", accountBytes )
	err = session.Save()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("save session err"))
		ctx.JSON(httpresp.Fail400(nil, "Invalid username or password."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Ok") )
}
func(c * Scanner) IsAuth (ctx * gin.Context){
	session := sessions.Default(ctx)
	sessionVal := session.Get("account")
	if(sessionVal == nil){
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return
	}
	account := model.ScannerAccount{}
	err := account.Bind(sessionVal)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindAccountErr"))
		ctx.AbortWithStatus(http.StatusUnauthorized)
		return 
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"account": account,
	}, "Ok") )
}


func NewScannerController () ScannerController{
	return &Scanner{
		ScannerAccountRepo: repository.NewScannerAccountRepository(),
	}
}