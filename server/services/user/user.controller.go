package user

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
)

type User struct{
	userRepo repository.UserRepository
}

func NewUserController() UserController {
	return &User{
		userRepo: repository.NewUserRepository(),
	}
}
type UserController interface {
	GetUserTypes(ctx *gin.Context)
	GetUserProgramsAndStrands(ctx *gin.Context)
	NewUserType(ctx *gin.Context)
}

func (ctrler * User)GetUserTypes(ctx *gin.Context){
	userTypes, err := ctrler.userRepo.GetUserTypes()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("getUserTypesErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"userTypes": userTypes,
	}, "User types fetched."))

}
func (ctrler * User)NewUserType(ctx *gin.Context){
	userType := model.UserType{}
	err := ctx.ShouldBindJSON(&userType)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.userRepo.NewUserType(userType)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("NewUserType"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
	}, "New user type added."))

}
func (ctrler * User)GetUserProgramsAndStrands(ctx *gin.Context){
	programs, err := ctrler.userRepo.GetUserProgramsAndStrands()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("getUserTypesErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"programs": programs,
	}, "User types fetched."))

}
