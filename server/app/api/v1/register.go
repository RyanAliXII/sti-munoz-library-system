package api

import (
	"slim-app/server/app/repository"
	"slim-app/server/app/services/author"
	authornum "slim-app/server/app/services/author_number"
	"slim-app/server/app/services/book"
	"slim-app/server/app/services/client"
	"slim-app/server/app/services/inventory"
	"slim-app/server/app/services/section"

	"slim-app/server/app/services/ddc"
	fundsrc "slim-app/server/app/services/fund_source"
	"slim-app/server/app/services/publisher"

	"github.com/gin-gonic/gin"
)

func RegisterAPIV1(router *gin.Engine, repositories *repository.Repositories) {
	grp := router.Group("/api/1")
	author.AuthorRoutes(grp.Group("/authors"), repositories)
	publisher.PublisherRoutes(grp.Group("/publishers"), repositories)
	fundsrc.FundSourceRoutes(grp.Group("/source-of-funds"), repositories)
	section.SectionRoutes(grp.Group("/sections"), repositories)
	authornum.AuthorNumberRoutes(grp.Group("/author-numbers"), repositories)
	ddc.DDCRoutes(grp.Group("/ddc"), repositories)
	book.BookRoutes(grp.Group("/books"), repositories)
	inventory.InventoryRoutes(grp.Group("/inventory"), repositories)
	client.ClientRoutes(grp.Group("/clients"), repositories)
}
