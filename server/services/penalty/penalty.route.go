package penalty

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)




func PenaltyRoutes (router * gin.RouterGroup){
	ctrler := NewPenaltyController()
	router.GET("/", middlewares.ValidateToken, ctrler.GetPenalties)
	router.PATCH("/:id/settlement", middlewares.ValidateToken, ctrler.UpdatePenaltySettlement)
	router.POST("/", middlewares.ValidateToken,middlewares.ValidateBody[AddPenaltyBody], ctrler.AddPenalty)
	router.PUT("/:id", middlewares.ValidateToken, middlewares.ValidateBody[EditPenaltyBody], ctrler.UpdatePenalty)
}