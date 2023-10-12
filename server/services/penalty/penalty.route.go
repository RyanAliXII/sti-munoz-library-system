package penalty

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)




func PenaltyRoutes (router * gin.RouterGroup){
	ctrler := NewPenaltyController()
	router.Use(middlewares.ValidatePermissions("Penalty.Access"))
	router.GET("/", 
	middlewares.BlockRequestFromClientApp,
	ctrler.GetPenalties)
	router.PATCH("/:id/settlement", 
	middlewares.BlockRequestFromClientApp,
	ctrler.UpdatePenaltySettlement)
	router.POST("/",
	middlewares.BlockRequestFromClientApp,
	middlewares.ValidateBody[AddPenaltyBody], 
	ctrler.AddPenalty)
	router.PUT("/:id",  
	middlewares.BlockRequestFromClientApp,
	middlewares.ValidateBody[EditPenaltyBody], ctrler.UpdatePenalty)
}