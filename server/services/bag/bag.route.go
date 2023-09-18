package bag

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)





func BagRoutes (router * gin.RouterGroup) {
	controller := NewBagController()
	router.POST("/",middlewares.ValidateToken, middlewares.ValidateBody[BagItem]  ,controller.AddBagItem)
	router.GET("/",middlewares.ValidateToken, controller.GetBagItems)
	router.DELETE("/:id",middlewares.ValidateToken, controller.DeleteItemFromBag)
	router.PATCH("/:id/checklist", middlewares.ValidateToken, controller.CheckItemFromBag)
	router.PATCH("/checklist", middlewares.ValidateToken, controller.CheckOrUncheckAllItems)
	router.DELETE("/checklist", middlewares.ValidateToken,  controller.DeleteAllCheckedItems)
	router.POST("/checklist/checkout", middlewares.ValidateToken, controller.CheckoutCheckedItems)
}