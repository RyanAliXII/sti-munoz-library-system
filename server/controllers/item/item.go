package item

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)



type Item struct {
	services * services.Services
}

func NewItemController(services * services.Services) ItemController{
	return &Item{
		services:  services,
	}
}
type ItemController interface{
	GetItems(ctx * gin.Context)
}
func (ctrler * Item)GetItems(ctx * gin.Context) {
	filter := filter.ExtractFilter(ctx)
	if len(filter.Keyword) > 0 {
		items, err := ctrler.services.Repos.ItemRepository.SearchItems(&filter)
		if err != nil {
			ctrler.services.Logger.Error(err.Error(), applog.Error(err.Error()))
		}
		ctx.JSON(httpresp.Success200(gin.H{
			"items": items,
		}, "Items fetched."))
		return
	}

	ctx.JSON(httpresp.Success200(gin.H{
		"items": []struct{}{},
	}, "items fetched."))
	
}