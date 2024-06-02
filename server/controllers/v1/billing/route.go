package billing

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)



func BillingRendererRoutes(router * gin.RouterGroup,  services * services.Services){
	ctrler := NewBillingRenderer(services)
	router.GET("/penalty/:id",ctrler.RenderBillByPenaltyId)
}