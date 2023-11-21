package device

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)



func DeviceRoutes(router * gin.RouterGroup){
	ctrler := NewDeviceController()
	router.POST("", middlewares.BlockRequestFromClientApp, middlewares.ValidateBody[DeviceBody], ctrler.NewDevice )
	router.GET("", middlewares.BlockRequestFromClientApp, ctrler.GetDevices)
	router.PUT("/:id", middlewares.BlockRequestFromClientApp, middlewares.ValidateBody[DeviceBody], ctrler.UpdateDevice)
}