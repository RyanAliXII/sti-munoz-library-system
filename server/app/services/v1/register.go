package services

import (
	"slim-app/server/app/repository"
	"slim-app/server/app/services/v1/author"
	authornum "slim-app/server/app/services/v1/author-number"
	"slim-app/server/app/services/v1/book"
	"slim-app/server/app/services/v1/section"

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
	section.SectionRoutes(grp.Group("/sections"), repositories)
	authornum.AuthorNumberRoutes(grp.Group("/author-numbers"), repositories)
	ddc.DDCRoutes(grp.Group("/ddc"), repositories)
	book.BookRoutes(grp.Group("/books"), repositories)
}
