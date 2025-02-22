package device

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)



func DeviceRoutes(router * gin.RouterGroup, services * services.Services){
	ctrler := NewDeviceController(services)
	router.POST("", 
	services.PermissionValidator.Validate([]string{"Device.Add"}, true),
	middlewares.ValidateBody[DeviceBody], ctrler.NewDevice)
	
	router.GET("", 
	services.PermissionValidator.Validate([]string{"Device.Read"}, false), 
	ctrler.GetDevices)

	router.GET("/:id",
	services.PermissionValidator.Validate([]string{"Device.Read"}, false),
	 ctrler.GetDeviceById)

	router.PUT("/:id", 
	services.PermissionValidator.Validate([]string{"Device.Edit"}, true),
	middlewares.ValidateBody[DeviceBody], ctrler.UpdateDevice)

	router.DELETE("/:id", 
	services.PermissionValidator.Validate([]string{"Device.Delete"}, true), 
	ctrler.DeleteDevice)

	router.POST("/logs",
	services.PermissionValidator.Validate([]string{"DeviceLog.Add"}, true),
	ctrler.NewDeviceLog)

	router.GET("/logs", 
	services.PermissionValidator.Validate([]string{"DeviceLog.Read"}, true),
	ctrler.GetDeviceLogs)

	router.PATCH("/logs/:id/logout", 
	services.PermissionValidator.Validate([]string{"DeviceLog.Edit"}, true),
	ctrler.LogoutDevice)
}