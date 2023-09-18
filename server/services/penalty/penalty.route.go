package penalty

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)




func PenaltyRoutes (router * gin.RouterGroup){
	ctrler := NewPenaltyController()
	router.GET("/", ctrler.GetPenalties)
	router.PATCH("/:id/settlement", ctrler.UpdatePenaltySettlement)
	router.POST("/",middlewares.ValidateBody[AddPenaltyBody], ctrler.AddPenalty)
	router.PUT("/:id",  middlewares.ValidateBody[EditPenaltyBody], ctrler.UpdatePenalty)
}