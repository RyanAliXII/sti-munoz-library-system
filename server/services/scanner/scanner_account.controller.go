package scanner

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
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
	scannerAccountRepo repository.ScannerAccountRepository
} 

func(ctrler * ScannerAccount) NewAccount(ctx * gin.Context ){
	body := model.ScannerAccount{}
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	fieldsErr, err := body.ValidateUsernameIfTaken()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("ValidateUsernameIfTaken"))
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
		logger.Error(err.Error(), slimlog.Error("hashingErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error ocurred."))
		return
	}
	body.Password = string(hashedPassword)
	err =  ctrler.scannerAccountRepo.NewAccount(body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("NewAccountErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error ocurred."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Account created."))

}
func(ctrler * ScannerAccount) GeAccounts(ctx * gin.Context ){
	accounts, err := ctrler.scannerAccountRepo.GetAccounts()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("getAccountsErr"))
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
	fieldsErr, err := body.ValidateUsernameIfTakenOnUpdate()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("ValidateUsernameIfTaken"))
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
			logger.Error(err.Error(), slimlog.Error("hashingErr"))
			ctx.JSON(httpresp.Fail400(nil, "Unknown error ocurred."))
			return
		}
		body.Password = string(hashedPassword)
		err = ctrler.scannerAccountRepo.UpdateAccountWithPassword(body)
	}else{
		err = ctrler.scannerAccountRepo.UpdateAccount(body)
	}
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("UpdateErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error ocurred."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Account updated."))
	
}	
func(ctrler  *ScannerAccount)DeleteAccount(ctx * gin.Context) {
	id := ctx.Param("id")
	err := ctrler.scannerAccountRepo.DeleteAccountById(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("deleteErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error ocurred."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Account deleted."))
}

func NewScannerAccountController()ScannerAccountController{
	return &ScannerAccount{
		scannerAccountRepo: repository.NewScannerAccountRepository(),
	}
}