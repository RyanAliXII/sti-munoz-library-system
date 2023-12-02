package user

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
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

