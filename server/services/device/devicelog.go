package device

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func (ctrler * Device)NewDeviceLog(ctx * gin.Context) {
	log := model.DeviceLog{}
	err := ctx.ShouldBindBodyWith(&log, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("DeviceLog"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.deviceRepo.NewDeviceLog(log)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("DeviceLog"))
	}
	ctx.JSON(httpresp.Success200(nil, "Device has been logged."))
} 