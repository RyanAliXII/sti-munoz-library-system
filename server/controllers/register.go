package controllers

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/account"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/author"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/authornumber"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/printables"

	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/bag"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/book"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/borrowing"

	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/clientlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/content"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/dateslot"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/ddc"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/device"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/extras"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/game"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/inventory"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/item"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/notification"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/penalty"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/publisher"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/reports"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/reservation"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/scanner"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/searchtag"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/section"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/stats"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/system"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/timeslot"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/user"
	"github.com/gin-gonic/gin"
)

func RegisterAPIV1(router *gin.Engine) {
	grp := router.Group("/api/1")
	grp.Use(middlewares.ValidateToken)
	author.AuthorRoutes(grp.Group("/authors"))
	publisher.PublisherRoutes(grp.Group("/publishers"))
	section.SectionRoutes(grp.Group("/sections"))
	authornumber.AuthorNumberRoutes(grp.Group("/author-numbers"))
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
	game.GameRoutes(grp.Group("/games"))
	device.DeviceRoutes(grp.Group("/devices"))
	timeslot.TimeSlotRoutes(grp.Group("/time-slots"))
	dateslot.DateSlotRoutes(grp.Group("/date-slots"))
	reservation.ReservationRoutes(grp.Group("/reservations"))
	reports.ReportRoutes(grp.Group("/reports"))
	user.UserRoutes(grp.Group("/users"))
	item.ItemRoutes(grp.Group("/items"))
	notification.NotificationRoutes(grp.Group("/notifications"))
	searchtag.SearchTagRoutes(grp.Group("/search-tags"))
	content.ContentRoutes(grp.Group("/contents"))
	extras.ExtrasRoutes(grp.Group("/"))
}

func Register(r * gin.Engine){
	printables.RegisterPrintablesGeneratorRoutes(r.Group("/printables-generator"))
	printables.RegisterPrintablesRoutes(r.Group("/printables"))
	reports.ReportRendererRoutes(r.Group("/renderer"))
	scanner.ScannerRoutes(r.Group("/scanner/"))
}