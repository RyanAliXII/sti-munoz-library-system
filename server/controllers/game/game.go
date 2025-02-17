package game

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type Game struct {
	services * services.Services
}
type GameController interface{ 
	NewGame (ctx * gin.Context) 
	GetGames(ctx * gin.Context)
	UpdateGame(ctx * gin.Context)
	DeleteGame(ctx * gin.Context)
	LogGame(ctx * gin.Context)
	GetGameLogs(ctx * gin.Context)
	DeleteGameLog(ctx * gin.Context)
	UpdateGameLog(ctx * gin.Context)
	LogoutGame(ctx * gin.Context)
}

func NewGameController (sevices * services.Services) GameController{
	return &Game{
		services: sevices,
	}
}

func (ctrler * Game)NewGame(ctx * gin.Context) {
	game := model.Game{}
	err := ctx.ShouldBindBodyWith(&game, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.services.Repos.GameRepository.NewGame(game)
	if err != nil {
		logger.Error(err.Error())
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	
	ctx.JSON(httpresp.Success200(nil, "Game added."))
}

func (ctrler * Game)UpdateGame(ctx * gin.Context){
	id := ctx.Param("id")
	game := model.Game{}
	err := ctx.ShouldBindBodyWith(&game, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	game.Id = id
	err =  ctrler.services.Repos.GameRepository.UpdateGame(game)
	if err != nil {
		logger.Error(err.Error())
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	
	ctx.JSON(httpresp.Success200(nil, "Game updated."))
}
func (ctrler * Game)DeleteGame(ctx * gin.Context){
	id := ctx.Param("id")
	
	err :=  ctrler.services.Repos.GameRepository.DeleteGame(id)
	if err != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Game deleted."))
}
func (ctrler * Game)GetGames(ctx * gin.Context){
	games, err :=  ctrler.services.Repos.GameRepository.GetGames()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetGamesErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"games": games,
	}, "Game fetched."))
}

