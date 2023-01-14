package services

import (
	"slim-app/server/app/repository"
	"slim-app/server/app/services/v1/author"
	authornum "slim-app/server/app/services/v1/author-number"
	"slim-app/server/app/services/v1/category"
	"slim-app/server/app/services/v1/ddc"
	"slim-app/server/app/services/v1/publisher"
	"slim-app/server/app/services/v1/sof"

	"github.com/gin-gonic/gin"
)

func RegisterServicesV1(router *gin.Engine, repositories *repository.Repositories) {
	grp := router.Group("/api/1")
	author.AuthorRoutes(grp.Group("/authors"), repositories)
	publisher.PublisherRoutes(grp.Group("/publishers"), repositories)
	sof.FundSourceRoutes(grp.Group("/source-of-funds"), repositories)
	category.CategoryRoutes(grp.Group("/categories"), repositories)
	authornum.AuthorNumberRoutes(grp.Group("/author-numbers"), repositories)
	ddc.DDCRoutes(grp.Group("/ddc"), repositories)
}
