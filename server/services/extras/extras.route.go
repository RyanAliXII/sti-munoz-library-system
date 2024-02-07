package extras

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)


func ExtrasRoutes (router * gin.RouterGroup){
	ctrler := NewExtrasController()

	router.PUT("/faqs", middlewares.BlockRequestFromClientApp, ctrler.UpdateFAQsPage )
	router.GET("/faqs", middlewares.BlockRequestFromClientApp, ctrler.GetFAQsContent)
	router.PUT("/policy", middlewares.BlockRequestFromClientApp, ctrler.UpdatePolicyPage )
	router.GET("/policy", middlewares.BlockRequestFromClientApp, ctrler.GetPolicyContent)
}