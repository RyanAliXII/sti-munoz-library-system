package user

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)


func UserRoutes(router * gin.RouterGroup){
	userCtrler := NewUserController()
	router.Use(middlewares.BlockRequestFromClientApp)
	router.GET("/types", userCtrler.GetUserTypes)
	router.POST("/types",middlewares.ValidateBody[UserType], userCtrler.NewUserType)
	router.PUT("/types/:id",middlewares.ValidateBody[UserType], userCtrler.UpdateUserType)
	router.GET("/programs", userCtrler.GetUserProgramsAndStrands)
	router.POST("/programs", middlewares.ValidateBody[UserProgram], userCtrler.NewUserProgram)
	router.PUT("/programs/:id", middlewares.ValidateBody[UserProgram], userCtrler.UpdateUserProgram)
}