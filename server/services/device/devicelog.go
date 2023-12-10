package device

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
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
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Device has been logged."))
} 
func (ctrler * Device)GetDeviceLogs(ctx * gin.Context) {
	filter := NewDeviceLogFilter(ctx)
	logs, metadata, err  := ctrler.deviceRepo.GetDeviceLogs(&repository.DeviceLogFilter{
		From: filter.From,
		To: filter.To,
		Filter: filter.Filter,
	})
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("DeviceLog"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"deviceLogs": logs,
		"metadata": metadata,
	}, "Device Logs fetched."))
} 

func (ctrler * Device)LogoutDevice(ctx * gin.Context) {
	id := ctx.Param("id")
	err := ctrler.deviceRepo.DeviceLogout(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("DeviceLogout"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Device Logs fetched."))
} 

