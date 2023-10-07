package scanner

import (
	"net/http"
	"os"

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
	LogClient (ctx * gin.Context)
	Logout (ctx * gin.Context)
}

type Scanner struct {
	ScannerAccountRepo repository.ScannerAccountRepository
	ClientLogRepo repository.ClientLogRepository
	accountRepo repository.AccountRepositoryInterface

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
	domain := os.Getenv("SCANNER_APP_DOMAIN")
	session := sessions.Default(ctx)
	session.Options(sessions.Options{
		MaxAge: 3600 * 16, //16 hrs
		Domain: domain,
	})
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
func(c * Scanner) LogClient (ctx * gin.Context){
	clientId := ctx.Param("clientId")
	scannerId := ctx.GetString("accountId")
	err := c.ClientLogRepo.NewLog(clientId, scannerId)
	if err != nil {
		logger.Error(err.Error())
		ctx.JSON(httpresp.Fail400(nil,"Unknown error occured."))
		return
	}
	account := c.accountRepo.GetAccountById(clientId)
	ctx.JSON(httpresp.Success200(gin.H{
		"client": account,
	}, "Ok") )
}

func(c * Scanner) Logout (ctx * gin.Context){
	session := sessions.Default(ctx)
	session.Options(sessions.Options{MaxAge: -1})
	session.Clear()
	err := session.Save()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("saveSessionErr"))
	}
	ctx.JSON(httpresp.Success200(nil, "Ok"))
}




func NewScannerController () ScannerController{
	return &Scanner{
		ScannerAccountRepo: repository.NewScannerAccountRepository(),
		ClientLogRepo: repository.NewClientLog(),
		accountRepo: repository.NewAccountRepository(),
	}
}