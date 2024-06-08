package penalty

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

func PenaltyRoutes (router * gin.RouterGroup, services * services.Services){
	ctrler := NewPenaltyController(services)
	router.GET("/", 
	ctrler.GetPenalties)
	router.GET("/:id/bill", middlewares.ValidatePermissions([]string{"Penalty.Read"}, false), ctrler.GetBill)
	router.GET("/export", middlewares.ValidatePermissions([]string{"Penalty.Read"}, true), ctrler.ExportPenalties)
	router.PATCH("/:id/settlement", 
	middlewares.ValidatePermissions([]string{"Penalty.Edit"}, true),
	ctrler.UpdatePenaltySettlement)
	router.POST("/",
	middlewares.ValidatePermissions([]string{"Penalty.Add"}, true),
	middlewares.ValidateBody[AddPenaltyBody], 
	ctrler.AddPenalty)
	router.PUT("/:id",  
	middlewares.ValidatePermissions([]string{"Penalty.Edit"}, true),
	middlewares.ValidateBody[EditPenaltyBody], ctrler.UpdatePenalty)
	router.POST("/classifications", 
	middlewares.ValidatePermissions([]string{"Penalty.Add"}, true),
	ctrler.NewClassfication)
	router.GET("/classifications", 
	middlewares.ValidatePermissions([]string{"Penalty.Read"}, true),
	ctrler.GetPenaltyClasses)
	router.PUT("/classifications/:id",
	middlewares.ValidatePermissions([]string{"Penalty.Edit"}, true),
	ctrler.UpdatePenaltyClass)
	router.DELETE("/classifications/:id",
	middlewares.ValidatePermissions([]string{"Penalty.Delete"}, true),
	ctrler.DeletePenaltyClass)
	router.GET("/:id/proofs",
	 middlewares.ValidatePermissions([]string{"Penalty.Read"}, true), 
	 ctrler.GetProofOfPaymentUrl)
}