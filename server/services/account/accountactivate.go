package account

import (
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gin-gonic/gin"
	"github.com/gocarina/gocsv"
)

func (ctrler * AccountController) ActivateBulk (ctx * gin.Context){
	fileHeader, fileHeaderErr := ctx.FormFile("file")
	if fileHeaderErr != nil {
		ctx.JSON(httpresp.Fail400(nil, "No files uploaded."))
		return
	}
	file, fileErr := fileHeader.Open()
	if fileErr != nil {
		logger.Error(fileErr.Error(), slimlog.Function("AccountController.ActivateBulk"), slimlog.Error("fileErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	defer file.Close()


	//const ExpectedFileExtension = ".csv"
	fileExtension := filepath.Ext(fileHeader.Filename)
	// if(fileExtension != ExpectedFileExtension){
	// 	logger.Error("File is not csv.", slimlog.Function("AccountController.ActivateBulk"), slimlog.Error("WrongFileExtensionErr"))
	// 	ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
	// 	return
	// }
	switch(fileExtension){
		case ".csv":
		ctrler.handleCSV(file, ctx)
		return 
	}
	ctx.JSON(httpresp.Fail400(nil, "Invalid file."))
	
}

func(ctrler * AccountController) handleCSV(file multipart.File, ctx * gin.Context){

	err := ctrler.validateCSVHeaders(file, map[string]struct{}{
		"surname": {},
		"given_name": {},
		"student_number": {},
		"user_type": {},
		"program": {},
	})

	
	if err != nil {
		ctx.JSON(httpresp.Fail400(gin.H{
			"error": err.Error(),
		}, "Invalid CSV structure."))
		return 
	}
	_, err = file.Seek(0, 0)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("SeekingErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknowne error occured."))
		return 
	}

	
	bytesFile, toBytesErr := io.ReadAll(file)
	accounts := make([]model.AccountActivation, 0)
	if toBytesErr != nil {
		logger.Error(toBytesErr.Error(), slimlog.Function("AccountController.ActivateBulk"), slimlog.Error("toBytesErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = gocsv.UnmarshalBytes(bytesFile, &accounts)
	if err != nil {
		logger.Error(err.Error(), slimlog.Function("AccountController.ImportAccount"), slimlog.Error("UnmarshalBytesErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.validateTypeAndProgram(accounts)
	if err != nil {
		logger.Error(err.Error())
	}
	ctx.JSON(httpresp.Success200(nil, "Accounts activated."))
}

func(ctrler * AccountController)validateTypeAndProgram(accounts []model.AccountActivation) error {
	types, err  := ctrler.userRepo.GetUserTypesToMap()	
	if err != nil {
		return err
	}
	fmt.Println(types)
	programs, err := ctrler.userRepo.GetUserProgramsAndStrandsToMap()
	if err != nil {
		return err
	}
	fmt.Println(programs)
	for _, account := range accounts {
		if(account.UserType == 0) {

		}
	}
	return nil
}
