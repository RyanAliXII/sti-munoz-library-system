package game

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
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
	err = ctrler.gameRepo.Log(gameLog)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("LogErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Game logged."))
}