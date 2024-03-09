package searchtag

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
)



type SearchTag struct {
	searchTagRepo repository.SearchTagRepository
}

type SearchTagController interface{
	GetSearchTags(ctx * gin.Context)
}

func NewSearchTagController () SearchTagController {
	return &SearchTag{
		searchTagRepo: repository.NewSearchTagRepository(),
	}
}
func (ctrler * SearchTag)GetSearchTags(ctx * gin.Context) {
	tags, err := ctrler.searchTagRepo.GetSearchTags()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("Error getting search tags."))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"tags": tags,
	}, "Tags fetched."))
}