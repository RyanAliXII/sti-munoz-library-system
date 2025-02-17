package game

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)
func (ctrler * Game)LogGame(ctx * gin.Context) {
	gameLog := model.GameLog{}
	err := ctx.ShouldBindBodyWith(&gameLog, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("BindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	}
	err =  ctrler.services.Repos.GameRepository.Log(gameLog)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("LogErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Game logged."))
}
func (ctrler * Game)GetGameLogs(ctx * gin.Context){
	filter := NewGameLogFilter(ctx)
	logs,metadata, err :=  ctrler.services.Repos.GameRepository.GetLogs(&repository.GameLogFilter{
		From: filter.From,
		To: filter.To,
		Filter: filter.Filter,
	})
	if err != nil {
	   logger.Error(err.Error(), slimlog.Error("GetLogsErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"gameLogs": logs,
		"metadata": metadata,
	}, "Logs fetched."))
}
func(ctrler * Game) DeleteGameLog(ctx * gin.Context){
	id :=  ctx.Param("id")
	err :=  ctrler.services.Repos.GameRepository.DeleteLog(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error(err.Error()))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Log deleted."))
}
func(ctrler * Game)UpdateGameLog(ctx * gin.Context){
	id := ctx.Param("id")
	gameLog := model.GameLog{}
	err := ctx.ShouldBindBodyWith(&gameLog, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("BindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	}
	gameLog.Id = id
	err =  ctrler.services.Repos.GameRepository.UpdateLog(gameLog)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error(err.Error()))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Log deleted."))
}

func (ctrler * Game)LogoutGame(ctx * gin.Context) {
	id := ctx.Param("id")
	err :=  ctrler.services.Repos.GameRepository.GameLogout(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("DeviceLogout"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Device Logs fetched."))
} 
