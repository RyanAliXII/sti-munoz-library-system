package game

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type Game struct {
	gameRepo repository.GameRepository
}
type GameController interface{ 
	NewGame (ctx * gin.Context) 
	GetGames(ctx * gin.Context)
}

func NewGameController () GameController{
	return &Game{
		gameRepo: repository.NewGameRepository(),
	}
}

func (ctrler * Game)NewGame (ctx * gin.Context) {
	game := model.Game{}
	err := ctx.ShouldBindBodyWith(&game, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.gameRepo.NewGame(game)
	if err != nil {
		logger.Error(err.Error())
		ctx.JSON(httpresp.Success200(nil, "Unknown error occured."))
		return
	}
	
	ctx.JSON(httpresp.Success200(nil, "Game added."))
}

func (ctrler * Game)GetGames(ctx * gin.Context){
	games, err := ctrler.gameRepo.GetGames()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetGamesErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"games": games,
	}, "Game fetched."))
}