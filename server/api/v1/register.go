package api

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/account"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/author"
	authornum "github.com/RyanAliXII/sti-munoz-library-system/server/services/author_number"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/bag"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/book"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/borrowing"
	clientlog "github.com/RyanAliXII/sti-munoz-library-system/server/services/client_log"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/ddc"
	fundsrc "github.com/RyanAliXII/sti-munoz-library-system/server/services/fund_source"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/inventory"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/penalty"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/publisher"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/scanner"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/section"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/stats"
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
	system.SystemRoutes(grp.Group("/system"))
	penalty.PenaltyRoutes(grp.Group("/penalties"))
	stats.StatsRoutes(grp.Group("/stats"))
	borrowing.BorrowingRoutes(grp.Group("/borrowing"))
	bag.BagRoutes(grp.Group("/bag"))
	scanner.ScannerAccountRoutes(grp.Group("/scanner-accounts"))
	clientlog.ClientLogRoutes(grp.Group("/client-logs"))
}
