package device

import (
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/gin-gonic/gin"
)


type DeviceBody struct {
	Name string `json:"name" binding:"required,max=100"`
	Description string `json:"description" binding:"required,max=255"`
}


type DeviceLogFilter struct {
	From  string `form:"from"`
	To string `form:"to"`
	Filter filter.Filter
}
func NewDeviceLogFilter(ctx * gin.Context) *DeviceLogFilter{
	filter := &DeviceLogFilter{}
	err := ctx.BindQuery(&filter)
	if err != nil {
		logger.Error(err.Error())
	}
	filter.Filter.ExtractFilter(ctx)
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
	return filter
}
