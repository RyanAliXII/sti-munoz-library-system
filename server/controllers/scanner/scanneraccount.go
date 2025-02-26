package scanner

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"golang.org/x/crypto/bcrypt"
)

type ScannerAccountController interface{
	NewAccount(ctx * gin.Context)
	GeAccounts(ctx * gin.Context )
	UpdateAccount(ctx * gin.Context)
	DeleteAccount(ctx * gin.Context)
}
type ScannerAccount struct{
	services * services.Services
} 

func(ctrler * ScannerAccount) NewAccount(ctx * gin.Context ){
	body := model.ScannerAccount{}
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	fieldsErr, err := ctrler.services.Validator.ScannerAcountValidator.ValidateUsernameIfTaken(&body)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("ValidateUsernameIfTaken"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error ocurred."))
		return
	}
	if(len(fieldsErr) > 0){
		ctx.JSON(httpresp.Fail400(gin.H{
			"errors":  fieldsErr,
		}, "Unknown error ocurred."))
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("hashingErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error ocurred."))
		return
	}
	body.Password = string(hashedPassword)
	err =  ctrler.services.Repos.ScannerAccount.NewAccount(body)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("NewAccountErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error ocurred."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Account created."))

}
func(ctrler * ScannerAccount) GeAccounts(ctx * gin.Context ){
	accounts, err := ctrler.services.Repos.ScannerAccount.GetAccounts()
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("getAccountsErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"scannerAccounts": accounts, 
	}, "Accounts fetched."))

}
func(ctrler * ScannerAccount)UpdateAccount(ctx * gin.Context){
	id := ctx.Param("id")
	body := model.ScannerAccount{}
	body.Id = id
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	fieldsErr, err := ctrler.services.Validator.ScannerAcountValidator.ValidateUsernameIfTakenOnUpdate(&body)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("ValidateUsernameIfTaken"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error ocurred."))
		return
	}
	if(len(fieldsErr) > 0){
		ctx.JSON(httpresp.Fail400(gin.H{
			"errors":  fieldsErr,
		}, "Unknown error ocurred."))
		return
	}
	
	if(len(body.Password) > 0) {
		hashedPassword, hashErr := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
		if hashErr != nil {
			ctrler.services.Logger.Error(hashErr.Error(), applog.Error("hashingErr"))
			ctx.JSON(httpresp.Fail400(nil, "Unknown error ocurred."))
			return
		}
		body.Password = string(hashedPassword)
		err = ctrler.services.Repos.ScannerAccount.UpdateAccountWithPassword(body)
	}else{
		err = ctrler.services.Repos.ScannerAccount.UpdateAccount(body)
	}
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("UpdateErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error ocurred."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Account updated."))
	
}	
func(ctrler  *ScannerAccount)DeleteAccount(ctx * gin.Context) {
	id := ctx.Param("id")
	err := ctrler.services.Repos.ScannerAccount.DeleteAccountById(id)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("deleteErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error ocurred."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Account deleted."))
}

func NewScannerAccountController(services * services.Services)ScannerAccountController{
	return &ScannerAccount{
		services: services,
	}
}