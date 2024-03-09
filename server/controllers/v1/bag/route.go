package bag

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)





func BagRoutes (router * gin.RouterGroup) {
	controller := NewBagController()
	router.POST("/",middlewares.ValidateBody[BagItem]  ,controller.AddBagItem)
	router.GET("/",controller.GetBagItems)
	router.DELETE("/:id",controller.DeleteItemFromBag)
	router.PATCH("/:id/checklist", controller.CheckItemFromBag)
	router.PATCH("/checklist", controller.CheckOrUncheckAllItems)
	router.DELETE("/checklist",controller.DeleteAllCheckedItems)
	router.POST("/checklist/checkout",controller.CheckoutCheckedItems)
}