package extras

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)


func ExtrasRoutes (router * gin.RouterGroup, services * services.Services ){
	ctrler := NewExtrasController(services)
	router.PUT("/faqs", middlewares.BlockRequestFromClientApp(services.Config.AdminAppClientID), ctrler.UpdateFAQsPage )
	router.GET("/faqs", middlewares.BlockRequestFromClientApp(services.Config.AdminAppClientID), ctrler.GetFAQsContent)
	router.PUT("/policy", middlewares.BlockRequestFromClientApp(services.Config.AdminAppClientID), ctrler.UpdatePolicyPage )
	router.GET("/policy", middlewares.BlockRequestFromClientApp(services.Config.AdminAppClientID), ctrler.GetPolicyContent)
}