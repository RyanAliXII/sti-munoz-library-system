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
	UpdateGame(ctx * gin.Context)
	DeleteGame(ctx * gin.Context)
	LogGame(ctx * gin.Context)
	GetGameLogs(ctx * gin.Context)
	DeleteGameLog(ctx * gin.Context)
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
	err = ctrler.gameRepo.UpdateGame(game)
	if err != nil {
		logger.Error(err.Error())
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	
	ctx.JSON(httpresp.Success200(nil, "Game updated."))
}
func (ctrler * Game)DeleteGame(ctx * gin.Context){
	id := ctx.Param("id")
	
	err := ctrler.gameRepo.DeleteGame(id)
	if err != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Game deleted."))
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
func (ctrler * Game)GetGameLogs(ctx * gin.Context){
	logs, err := ctrler.gameRepo.GetLogs()
	if err != nil {
	   logger.Error(err.Error(), slimlog.Error("GetLogsErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"gameLogs": logs,
	}, "Logs fetched."))
}
func(ctrler * Game) DeleteGameLog(ctx * gin.Context){
	id :=  ctx.Param("id")
	err := ctrler.gameRepo.DeleteLog(id)
	if err != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Log deleted."))
}

