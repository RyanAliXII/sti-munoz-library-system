package game

import (
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/gin-gonic/gin"
)
type GameBody struct {
	Name string `json:"name" binding:"required,max=100,min=1"`
	Description string `json:"description" binding:"required,min=1,max=255"`
}

type GameLogBody struct {
	AccountId string `json:"accountId" binding:"required,uuid"`
	GameId string `json:"gameId" binding:"required,uuid"`
}
type GameLogFilter struct {
	From  string `form:"from"`
	To string `form:"to"`
	Filter filter.Filter
}
func NewGameLogFilter(ctx * gin.Context) *GameLogFilter{
	filter := &GameLogFilter{}
	ctx.BindQuery(&filter)
	filter.Filter.ExtractFilter(ctx)
	_, err  := time.Parse(time.DateOnly, filter.From)
	if err != nil {
		filter.From = ""
		filter.To = ""
	}
	_, err = time.Parse(time.DateOnly, filter.To)
	if(err != nil){
		filter.From = ""
		filter.To = ""
	}
	return filter
}
