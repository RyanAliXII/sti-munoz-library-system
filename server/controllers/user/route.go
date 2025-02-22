package user

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)


func UserRoutes(router * gin.RouterGroup, services * services.Services){
	userCtrler := NewUserController(services)
	
	router.GET("/types", 
	services.PermissionValidator.Validate([]string{"AccountTypeProgram.Read"}, true),
	userCtrler.GetUserTypes)

	router.POST("/types",
	services.PermissionValidator.Validate([]string{"AccountTypeProgram.Add"}, true),
	middlewares.ValidateBody[UserType], userCtrler.NewUserType)
	
	router.PUT("/types/:id",
	services.PermissionValidator.Validate([]string{"AccountTypeProgram.Edit"}, true),
	middlewares.ValidateBody[UserType], userCtrler.UpdateUserType)

	router.GET("/types/:typeId/programs",
	services.PermissionValidator.Validate([]string{"AccountTypeProgram.Read"}, true),
	userCtrler.GetUserProgramsAndStrandsByType)
	
	router.GET("/programs", 
	services.PermissionValidator.Validate([]string{"AccountTypeProgram.Read"}, true),
	userCtrler.GetUserProgramsAndStrands)
	
	router.POST("/programs",
	services.PermissionValidator.Validate([]string{"AccountTypeProgram.Add"}, true),
	middlewares.ValidateBody[UserProgram], userCtrler.NewUserProgram)
	
	router.PUT("/programs/:id",
	services.PermissionValidator.Validate([]string{"AccountTypeProgram.Edit"}, true),
	middlewares.ValidateBody[UserProgram], userCtrler.UpdateUserProgram)
}