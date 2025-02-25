package account

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/gocarina/gocsv"
)
type ActivateBulkError struct {
	Messages []string `json:"messages"`
	Err error
}

func (e * ActivateBulkError) Error() string {
	return e.Err.Error()
}
func (ctrler *Account) ActivateBulk (ctx * gin.Context){
	fileHeader, fileHeaderErr := ctx.FormFile("file")
	if fileHeaderErr != nil {
		ctx.JSON(httpresp.Fail400(nil, "No files uploaded."))
		return
	}
	file, fileErr := fileHeader.Open()
	if fileErr != nil {
		ctrler.services.Logger.Error(fileErr.Error(), applog.Function("AccountController.ActivateBulk"), applog.Error("fileErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	defer file.Close()

	fileExtension := filepath.Ext(fileHeader.Filename)
	switch(fileExtension){
		case ".csv":
		ctrler.handleCSV(file, ctx)
		return 
	}
	ctx.JSON(httpresp.Fail400(nil, "Invalid file."))
	
}

func(ctrler *Account) handleCSV(file multipart.File, ctx * gin.Context){

	err := ctrler.validateCSVHeaders(file, map[string]struct{}{
		"surname": {},
		"given_name": {},
		"student_number": {},
		"user_type": {},
		"program": {},
	})	
	if err != nil {
		ctx.JSON(httpresp.Fail400(gin.H{
			"errors":gin.H{
				"messages": []string{err.Error()},
			},
		}, "Invalid CSV structure."))
		return 
	}
	_, err = file.Seek(0, 0)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("SeekingErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknowne error occured."))
		return 
	}

	
	bytesFile, toBytesErr := io.ReadAll(file)
	accounts := make([]model.AccountActivation, 0)
	if toBytesErr != nil {
		ctrler.services.Logger.Error(toBytesErr.Error(), applog.Function("AccountController.ActivateBulk"), applog.Error("toBytesErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = gocsv.UnmarshalBytes(bytesFile, &accounts)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Function("AccountController.ImportAccount"), applog.Error("UnmarshalBytesErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.validateTypeAndProgram(&accounts)
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
		activateBulkErr, isActiveBulkErr := err.(*ActivateBulkError)
		if isActiveBulkErr {
			ctx.JSON(httpresp.Fail400(gin.H{
				"errors":gin.H{
					"messages": activateBulkErr.Messages,
				},
			}, "Validation error"))
			return 
		}
	
	}
	err = ctrler.services.Repos.AccountRepository.ActivateAccountBulk(accounts)
	if err != nil{
		ctrler.services.Logger.Error(err.Error())
		ctx.JSON(httpresp.Fail500(gin.H{
			"errors":gin.H{
				"messages": []string{"Unknown error occured."},
			},
		}, "Validation error"))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Accounts activated."))
}

func(ctrler *Account)validateTypeAndProgram(accounts * []model.AccountActivation) error {
	typesMaps, err  := ctrler.services.Repos.UserRepository.GetUserTypesToMap()	
	if err != nil {
		return err
	}
	settings := ctrler.services.Repos.SettingsRepository.Get()

	programsMap, err := ctrler.services.Repos.UserRepository.GetUserProgramsAndStrandsToMap()
	if err != nil {
		return err
	}
	messages := []string{}
	for idx, account := range *accounts {
		_, isAccountTypeExists := typesMaps[account.UserType]
		(*accounts)[idx].ActiveUntil = settings.AccountValidity.Value
		if(account.UserType != 0 && !isAccountTypeExists){
			messages = append(messages, fmt.Sprintf("User type is invalid on row: %d with value: %d", idx + 1, account.UserType))
			continue
		}
		
		if(account.UserType == 0) {
			var accountProgram = strings.TrimSpace(account.Program)
			program, isProgramExists := programsMap[accountProgram]
			if(!isProgramExists){
				messages = append(messages, fmt.Sprintf("Program is invalid or undefined on row: %d with value: %s", idx + 1, account.Program))
			}
		
			(*accounts)[idx].ProgramId = program.Id
			continue
		}
	}
	
	if(len(messages) > 0){
		return &ActivateBulkError{
			Messages: messages,
			Err: errors.New("error occured while validating type and program"),
		}
	}
	return nil
}

func (ctrler *Account)ActivateAccounts(ctx * gin.Context) {
	    body := AccountsActivateBody{}
		err := ctx.ShouldBindBodyWith(&body, binding.JSON)
		if err != nil {
			ctrler.services.Logger.Error(err.Error())
			ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
			return
		}
		settings := ctrler.services.Repos.SettingsRepository.Get()
		
		err = ctrler.services.Repos.AccountRepository.ActivateAccounts(body.AccountIds, body.UserTypeId, body.ProgramId, settings.AccountValidity.Value, body.StudentNumber)
		if err != nil {
			ctrler.services.Logger.Error(err.Error(), applog.Error("account activation error"))
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
			return
		}
		ctx.JSON(httpresp.Success200(nil, "Account Activated."))
}


func (ctrler *Account)DeactiveAccounts(ctx * gin.Context) {
	body := AccountsDeactivateBody{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err =  ctrler.services.Repos.AccountRepository.DeactiveAccounts(body.AccountIds)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("account activation error"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Account Deactivated."))
}