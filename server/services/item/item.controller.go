package item

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
)



type Item struct {
	itemRepo repository.ItemRepository
}

func NewItemController() ItemController{
	return &Item{
		itemRepo: repository.NewItemRepository(),
	}
}
type ItemController interface{
	GetItems(ctx * gin.Context)
}
func (ctrler * Item)GetItems(ctx * gin.Context) {
	filter := filter.ExtractFilter(ctx)
	if len(filter.Keyword) > 0 {
		items, err := ctrler.itemRepo.SearchItems(&filter)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error(err.Error()))
		}
		ctx.JSON(httpresp.Success200(gin.H{
			"items": items,
		}, "Unknown error occured."))
		return
	}

	ctx.JSON(httpresp.Success200(gin.H{
		"items": []struct{}{},
	}, "Unknown error occured."))
	
}