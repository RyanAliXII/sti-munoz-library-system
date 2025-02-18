package device

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)


type Device struct {
	deviceRepo repository.DeviceRepository
}

func NewDeviceController(service * services.Services) DeviceController{
	return &Device{
		deviceRepo: service.Repos.DeviceRepository,
	}
}
type DeviceController interface{
	NewDevice(ctx * gin.Context)
	GetDevices(ctx * gin.Context)
	UpdateDevice(ctx * gin.Context)
	DeleteDevice(ctx * gin.Context)
	GetDeviceById(ctx * gin.Context)
	NewDeviceLog(ctx * gin.Context) 
	GetDeviceLogs(ctx * gin.Context)
	LogoutDevice(ctx * gin.Context) 
}
func(ctrler * Device) NewDevice (ctx * gin.Context){
  device := model.Device{}

  err := ctx.ShouldBindBodyWith(&device, binding.JSON)
  if err != nil {
	logger.Error(err.Error(), slimlog.Error("BindErr"))
	ctx.JSON(httpresp.Fail400(nil, "Unknown error occurred."))
	return 
  }

  err = ctrler.deviceRepo.NewDevice(device)
  if err != nil {
	logger.Error(err.Error(), slimlog.Error("NewDeviceErr"))
	ctx.JSON(httpresp.Fail500(nil, "Unknown error occurred."))
	return
  }
  ctx.JSON(httpresp.Success200(nil, "Device added."))
}
func(ctrler * Device)GetDevices(ctx * gin.Context){
	devices, err := ctrler.deviceRepo.GetDevices()
	if err != nil {
		logger.Error(err.Error() , slimlog.Error("GetDevicesErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"devices": devices,
	}, "Fetched devices."))
}

func(ctrler * Device)UpdateDevice(ctx * gin.Context){
	id := ctx.Param("id")
	device := model.Device{}
	err := ctx.ShouldBindBodyWith(&device, binding.JSON)
	if err != nil {
	  logger.Error(err.Error(), slimlog.Error("BindErr"))
	  ctx.JSON(httpresp.Fail400(nil, "Unknown error occurred."))
	  return 
	}
	device.Id = id
	err = ctrler.deviceRepo.UpdateDevice(device)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("UpdateDeviceErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occurred."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Device updated."))
}

func(ctrler * Device)DeleteDevice(ctx * gin.Context){
	id := ctx.Param("id")
	err := ctrler.deviceRepo.DeleteDevice(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("DeleteDeviceErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occurred."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Device deleted."))
}

func(ctrler * Device)GetDeviceById(ctx * gin.Context){
	id := ctx.Param("id")
	device, err := ctrler.deviceRepo.GetDeviceById(id)
	if err != nil {
		logger.Error(err.Error() , slimlog.Error("GetDevicesErr"))
		ctx.JSON(httpresp.Fail404(nil, "Device not found."))
		return 
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"device": device,
	}, "Device fetched."))
}
