package searchtag

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)
type SearchTag struct {
	services * services.Services
}

type SearchTagController interface{
	GetSearchTags(ctx * gin.Context)
}

func NewSearchTagController (services * services.Services) SearchTagController {
	return &SearchTag{
		services: services,
	}
}
func (ctrler * SearchTag)GetSearchTags(ctx * gin.Context) {
	tags, err := ctrler.services.Repos.SearchTagRepository.GetSearchTags()
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("Error getting search tags."))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"tags": tags,
	}, "Tags fetched."))
}