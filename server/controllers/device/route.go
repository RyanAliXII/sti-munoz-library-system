package device

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)



func DeviceRoutes(router * gin.RouterGroup){
	ctrler := NewDeviceController()
	router.POST("", 
	middlewares.ValidatePermissions([]string{"Device.Add"}, true),
	middlewares.ValidateBody[DeviceBody], ctrler.NewDevice)
	
	router.GET("", 
	middlewares.ValidatePermissions([]string{"Device.Read"}, false), 
	ctrler.GetDevices)

	router.GET("/:id",
	middlewares.ValidatePermissions([]string{"Device.Read"}, false),
	 ctrler.GetDeviceById)

	router.PUT("/:id", 
	middlewares.ValidatePermissions([]string{"Device.Edit"}, true),
	middlewares.ValidateBody[DeviceBody], ctrler.UpdateDevice)

	router.DELETE("/:id", 
	middlewares.ValidatePermissions([]string{"Device.Delete"}, true), 
	ctrler.DeleteDevice)

	router.POST("/logs",
	middlewares.ValidatePermissions([]string{"DeviceLog.Add"}, true),
	ctrler.NewDeviceLog)

	router.GET("/logs", 
	middlewares.ValidatePermissions([]string{"DeviceLog.Read"}, true),
	ctrler.GetDeviceLogs)

	router.PATCH("/logs/:id/logout", 
	middlewares.ValidatePermissions([]string{"DeviceLog.Edit"}, true),
	ctrler.LogoutDevice)
}