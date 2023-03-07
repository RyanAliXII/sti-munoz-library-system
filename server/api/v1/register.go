package api

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/account"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/author"
	authornum "github.com/RyanAliXII/sti-munoz-library-system/server/services/author_number"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/book"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/circulation"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/ddc"
	fundsrc "github.com/RyanAliXII/sti-munoz-library-system/server/services/fund_source"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/inventory"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/publisher"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/section"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/system"

	"github.com/gin-gonic/gin"
)

func RegisterAPIV1(router *gin.Engine) {
	grp := router.Group("/api/1")
	grp.Use(middlewares.ValidateToken)
	author.AuthorRoutes(grp.Group("/authors"))
	publisher.PublisherRoutes(grp.Group("/publishers"))
	fundsrc.FundSourceRoutes(grp.Group("/source-of-funds"))
	section.SectionRoutes(grp.Group("/sections"))
	authornum.AuthorNumberRoutes(grp.Group("/author-numbers"))
	ddc.DDCRoutes(grp.Group("/ddc"))
	book.BookRoutes(grp.Group("/books"))
	inventory.InventoryRoutes(grp.Group("/inventory"))
	account.ClientRoutes(grp.Group("/accounts"))
	circulation.CirculationRoutes(grp.Group("/circulation"))
	system.SystemRoutes(grp.Group("/system"))
}
