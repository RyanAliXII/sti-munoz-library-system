package bag

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)





func BagRoutes (router * gin.RouterGroup) {
	controller := NewBagController()
	router.POST("/bag",middlewares.ValidateToken, middlewares.ValidateBody[BagItem]  ,controller.AddBagItem)
	router.GET("/bag",middlewares.ValidateToken, controller.GetBagItems)
	router.DELETE("/bag/:id",middlewares.ValidateToken, controller.DeleteItemFromBag)
	router.PATCH("/bag/:id/checklist", middlewares.ValidateToken, controller.CheckItemFromBag)
	router.PATCH("/bag/checklist", middlewares.ValidateToken, controller.CheckOrUncheckAllItems)
	router.DELETE("/bag/checklist", middlewares.ValidateToken,  controller.DeleteAllCheckedItems)
}