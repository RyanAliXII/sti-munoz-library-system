package game

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type Game struct {}
type GameController interface{ 
	NewGame (ctx * gin.Context) 
}

func NewGameController () GameController{
	return &Game{}
}

func (ctrler * Game)NewGame (ctx * gin.Context) {
	game := model.Game{}
	err := ctx.ShouldBindBodyWith(&game, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}

	
	ctx.JSON(httpresp.Success200(nil, "Game added."))
}