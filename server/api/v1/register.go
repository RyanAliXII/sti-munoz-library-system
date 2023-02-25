package api

import (
	"slim-app/server/services/author"
	authornum "slim-app/server/services/author_number"
	"slim-app/server/services/book"
	"slim-app/server/services/circulation"
	"slim-app/server/services/client"
	"slim-app/server/services/ddc"
	fundsrc "slim-app/server/services/fund_source"
	"slim-app/server/services/inventory"
	"slim-app/server/services/publisher"
	"slim-app/server/services/section"

	"github.com/gin-gonic/gin"
)

func RegisterAPIV1(router *gin.Engine) {
	grp := router.Group("/api/1")
	author.AuthorRoutes(grp.Group("/authors"))
	publisher.PublisherRoutes(grp.Group("/publishers"))
	fundsrc.FundSourceRoutes(grp.Group("/source-of-funds"))
	section.SectionRoutes(grp.Group("/sections"))
	authornum.AuthorNumberRoutes(grp.Group("/author-numbers"))
	ddc.DDCRoutes(grp.Group("/ddc"))
	book.BookRoutes(grp.Group("/books"))
	inventory.InventoryRoutes(grp.Group("/inventory"))
	client.ClientRoutes(grp.Group("/clients"))
	circulation.CirculationRoutes(grp.Group("/circulation"))
}
