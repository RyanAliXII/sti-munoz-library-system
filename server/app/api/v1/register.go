package api

import (
	"slim-app/server/app/api/v1/author"
	authornum "slim-app/server/app/api/v1/author-number"
	"slim-app/server/app/api/v1/book"
	"slim-app/server/app/api/v1/client"
	"slim-app/server/app/api/v1/inventory"
	"slim-app/server/app/api/v1/section"
	"slim-app/server/app/repository"

	"slim-app/server/app/api/v1/ddc"
	"slim-app/server/app/api/v1/publisher"
	"slim-app/server/app/api/v1/sof"

	"github.com/gin-gonic/gin"
)

func RegisterAPIV1(router *gin.Engine, repositories *repository.Repositories) {
	grp := router.Group("/api/1")
	author.AuthorRoutes(grp.Group("/authors"), repositories)
	publisher.PublisherRoutes(grp.Group("/publishers"), repositories)
	sof.FundSourceRoutes(grp.Group("/source-of-funds"), repositories)
	section.SectionRoutes(grp.Group("/sections"), repositories)
	authornum.AuthorNumberRoutes(grp.Group("/author-numbers"), repositories)
	ddc.DDCRoutes(grp.Group("/ddc"), repositories)
	book.BookRoutes(grp.Group("/books"), repositories)
	inventory.InventoryRoutes(grp.Group("/inventory"), repositories)
	client.ClientRoutes(grp.Group("/clients"), repositories)
}
