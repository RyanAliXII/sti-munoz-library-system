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
	router.GET("/programs", userCtrler.GetUserProgramsAndStrands)
}