package clientlog

import (
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/gin-gonic/gin"
)



type ClientLogFilter struct {
	From  string `form:"from"`
	To string `form:"to"`
	Filter filter.Filter
}

func NewFilter(ctx * gin.Context) *ClientLogFilter {
	filter := ClientLogFilter{}
	err := ctx.BindQuery(&filter)
	filter.Filter.ExtractFilter(ctx)
	if err != nil {
		logger.Error(err.Error())
	}
	_, err  = time.Parse(time.DateOnly, filter.From)
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