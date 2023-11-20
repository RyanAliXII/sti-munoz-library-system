package game

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/gin-gonic/gin"
)

type Game struct {}
type GameController interface{ 
	NewGame (ctx * gin.Context) 
}

func NewGameController () GameController{
	return &Game{}
}

func (ctrler * Game)NewGame (ctx * gin.Context) {

	
	ctx.JSON(httpresp.Success200(nil, "Game added."))
}