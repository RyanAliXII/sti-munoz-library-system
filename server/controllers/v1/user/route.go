package user

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)


func UserRoutes(router * gin.RouterGroup, services * services.Services){
	userCtrler := NewUserController(services)
	
	router.GET("/types", 
	middlewares.ValidatePermissions([]string{"AccountTypeProgram.Read"}, true),
	userCtrler.GetUserTypes)

	router.POST("/types",
	middlewares.ValidatePermissions([]string{"AccountTypeProgram.Add"}, true),
	middlewares.ValidateBody[UserType], userCtrler.NewUserType)
	
	router.PUT("/types/:id",
	middlewares.ValidatePermissions([]string{"AccountTypeProgram.Edit"}, true),
	middlewares.ValidateBody[UserType], userCtrler.UpdateUserType)

	router.GET("/types/:typeId/programs",
	middlewares.ValidatePermissions([]string{"AccountTypeProgram.Read"}, true),
	userCtrler.GetUserProgramsAndStrandsByType)
	
	router.GET("/programs", 
	middlewares.ValidatePermissions([]string{"AccountTypeProgram.Read"}, true),
	userCtrler.GetUserProgramsAndStrands)
	
	router.POST("/programs",
	middlewares.ValidatePermissions([]string{"AccountTypeProgram.Add"}, true),
	middlewares.ValidateBody[UserProgram], userCtrler.NewUserProgram)
	
	router.PUT("/programs/:id",
	middlewares.ValidatePermissions([]string{"AccountTypeProgram.Edit"}, true),
	middlewares.ValidateBody[UserProgram], userCtrler.UpdateUserProgram)
}