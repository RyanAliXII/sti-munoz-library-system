package system

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func (ctrler * System) GetAppSettings(ctx * gin.Context){
	settings :=ctrler.services.Repos.SettingsRepository.Get()
	ctx.JSON(httpresp.Success200(gin.H{"settings": settings}, "App settings fetched."))
}

func (ctrler * System)UpdateAppSettings(ctx * gin.Context){
	settings := model.SettingsValue{}
	err := ctx.ShouldBindBodyWith(&settings, binding.JSON)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("UpdateAppSettingsErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.services.Repos.SettingsRepository.UpdateSettings(settings)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("UpdateAppSettingsErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
	}
	ctx.JSON(httpresp.Success200(nil, "App settings updated."))
}