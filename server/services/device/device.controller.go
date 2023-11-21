package device

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)


type Device struct {
	deviceRepo repository.DeviceRepository
}

func NewDeviceController() DeviceController{
	return &Device{
		deviceRepo: repository.NewDevice(),
	}
}
type DeviceController interface{
	NewDevice(ctx * gin.Context)
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