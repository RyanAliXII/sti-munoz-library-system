package api

import (
	"slim-app/server/repository"
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
	repos := repository.NewRepositories()
	grp := router.Group("/api/1")
	author.AuthorRoutes(grp.Group("/authors"), repos)
	publisher.PublisherRoutes(grp.Group("/publishers"), repos)
	fundsrc.FundSourceRoutes(grp.Group("/source-of-funds"), repos)
	section.SectionRoutes(grp.Group("/sections"), repos)
	authornum.AuthorNumberRoutes(grp.Group("/author-numbers"), repos)
	ddc.DDCRoutes(grp.Group("/ddc"), repos)
	book.BookRoutes(grp.Group("/books"), repos)
	inventory.InventoryRoutes(grp.Group("/inventory"), repos)
	client.ClientRoutes(grp.Group("/clients"), repos)
	circulation.CirculationRoutes(grp.Group("/circulation"), repos)
}
