package extras

import "github.com/gin-gonic/gin"


func ExtrasRoutes (router * gin.RouterGroup){
	ctrler := NewExtrasController()

	router.PUT("/faqs", ctrler.UpdateFAQsPage )
	router.GET("/faqs", ctrler.GetFAQsContent)
	router.PUT("/policy", ctrler.UpdatePolicyPage )
	router.GET("/policy", ctrler.GetPolicyContent)
}