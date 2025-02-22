package clientlog

import (
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/gin-gonic/gin"
)



type ClientLogFilter struct {
	From  string `form:"from"`
	To string `form:"to"`
	UserTypes []int `form:"userTypes[]"`
	UserPrograms []int `form:"userPrograms[]"`
	SortBy string `form:"sortBy"`
	Order string `form:"order"`
	Filter filter.Filter
}

func NewFilter(ctx * gin.Context) *ClientLogFilter {
	filter := ClientLogFilter{}
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
	return &filter
}