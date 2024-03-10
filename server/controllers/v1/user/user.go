package user

import (
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type User struct{
	services * services.Services
}

func NewUserController(services * services.Services) UserController {
	return &User{
		services: services,
	}
}
type UserController interface {
	GetUserTypes(ctx *gin.Context)
	GetUserProgramsAndStrands(ctx *gin.Context)
	NewUserType(ctx *gin.Context)
	UpdateUserType(ctx *gin.Context)
	NewUserProgram(ctx *gin.Context)
	UpdateUserProgram(ctx *gin.Context)
	GetUserProgramsAndStrandsByType(ctx * gin.Context)
}

func (ctrler * User)GetUserTypes(ctx *gin.Context){
	
	filter := UserTypeFilter{}
	ctx.ShouldBindQuery(&filter)
	if filter.HasProgram {
		userTypes, err := ctrler.services.Repos.UserRepository.GetUserTypesWithProgram()
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("getUserTypesErr"))
		}
		ctx.JSON(httpresp.Success200(gin.H{
			"userTypes": userTypes,
		}, "User types with programs and strands fetched."))
		return 
	}
	userTypes, err := ctrler.services.Repos.UserRepository.GetUserTypes()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("getUserTypesErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"userTypes": userTypes,
	}, "User types fetched."))

}
func (ctrler * User)NewUserType(ctx *gin.Context){
	userType := model.UserType{}
	err := ctx.ShouldBindBodyWith(&userType, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.services.Repos.UserRepository.NewUserType(userType)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("NewUserType"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
	}, "New user type added."))

}

func (ctrler * User)NewUserProgram(ctx *gin.Context){
	program := model.UserProgramOrStrand{}
	err := ctx.ShouldBindBodyWith(&program, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err =  ctrler.services.Repos.UserRepository.NewProgram(program)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("NewUserProgram"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
	}, "New program added."))

}

func (ctrler * User)UpdateUserProgram(ctx *gin.Context){
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		logger.Error(err.Error(), slimlog.Error(err.Error()))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	program := model.UserProgramOrStrand{}
	err = ctx.ShouldBindBodyWith(&program, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	program.Id = id
	err =  ctrler.services.Repos.UserRepository.UpdateProgram(program)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("UpdateProgram"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
	}, "Program updated."))

}

func (ctrler * User)UpdateUserType(ctx *gin.Context){
	id, err := strconv.Atoi(ctx.Param("id"))

	if err != nil {
		logger.Error(err.Error(), slimlog.Error(err.Error()))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	userType := model.UserType{}
	err = ctx.ShouldBindBodyWith(&userType, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	userType.Id = id
	err = ctrler.services.Repos.UserRepository.UpdateUserType(userType)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("NewUserType"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
	}, "New user type added."))

}
func (ctrler * User)GetUserProgramsAndStrands(ctx *gin.Context){
	programs, err :=  ctrler.services.Repos.UserRepository.GetUserProgramsAndStrands()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("getUserTypesErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"programs": programs,
	}, "User programs fetched."))

}
func (ctrler * User)GetUserProgramsAndStrandsByType(ctx *gin.Context){
	id, err := strconv.Atoi(ctx.Param("typeId"))
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("getUserTypesErr"))
	}
	programs, err := ctrler.services.Repos.UserRepository.GetUserProgramsAndStrandsByType(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetUserProgramsAndStrandsByTypeErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"programs": programs,
	}, "User programs fetched by type."))

}

