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
	router.GET("/:id/bill", services.PermissionValidator.Validate([]string{"Penalty.Read"}, false), ctrler.GetBill)
	router.GET("/export", services.PermissionValidator.Validate([]string{"Penalty.Read"}, true), ctrler.ExportPenalties)
	router.PATCH("/:id/settlement", 
	services.PermissionValidator.Validate([]string{"Penalty.Edit"}, true),
	ctrler.UpdatePenaltySettlement)
	router.POST("/",
	services.PermissionValidator.Validate([]string{"Penalty.Add"}, true),
	middlewares.ValidateBody[AddPenaltyBody], 
	ctrler.AddPenalty)
	router.PUT("/:id",  
	services.PermissionValidator.Validate([]string{"Penalty.Edit"}, true),
	middlewares.ValidateBody[EditPenaltyBody], ctrler.UpdatePenalty)
	router.POST("/classifications", 
	services.PermissionValidator.Validate([]string{"Penalty.Add"}, true),
	ctrler.NewClassfication)
	router.GET("/classifications", 
	services.PermissionValidator.Validate([]string{"Penalty.Read"}, true),
	ctrler.GetPenaltyClasses)
	router.PUT("/classifications/:id",
	services.PermissionValidator.Validate([]string{"Penalty.Edit"}, true),
	ctrler.UpdatePenaltyClass)
	router.DELETE("/classifications/:id",
	services.PermissionValidator.Validate([]string{"Penalty.Delete"}, true),
	ctrler.DeletePenaltyClass)
	router.GET("/:id/proofs",
	 services.PermissionValidator.Validate([]string{"Penalty.Read"}, true), 
	 ctrler.GetProofOfPaymentUrl)
}