package controllers

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/account"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/author"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/authornumber"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/billing"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/printables"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

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

func RegisterAPIV1(router *gin.Engine, services * services.Services) {
	grp := router.Group("/api/1")
	grp.Use(middlewares.ValidateToken)
	author.AuthorRoutes(grp.Group("/authors"), services)
	publisher.PublisherRoutes(grp.Group("/publishers"), services)
	section.SectionRoutes(grp.Group("/sections"), services)
	authornumber.AuthorNumberRoutes(grp.Group("/author-numbers"), services)
	ddc.DDCRoutes(grp.Group("/ddc"), services)
	book.BookRoutes(grp.Group("/books"), services)
	inventory.InventoryRoutes(grp.Group("/inventory"),services)
	account.ClientRoutes(grp.Group("/accounts"), services)
	system.SystemRoutes(grp.Group("/system"), services)
	penalty.PenaltyRoutes(grp.Group("/penalties"), services)
	stats.StatsRoutes(grp.Group("/stats"), services)
	borrowing.BorrowingRoutes(grp.Group("/borrowing"), services)
	bag.BagRoutes(grp.Group("/bag"), services)
	scanner.ScannerAccountRoutes(grp.Group("/scanner-accounts"), services)
	clientlog.ClientLogRoutes(grp.Group("/client-logs"), services)
	game.GameRoutes(grp.Group("/games"), services)
	device.DeviceRoutes(grp.Group("/devices"))
	timeslot.TimeSlotRoutes(grp.Group("/time-slots"), services)
	dateslot.DateSlotRoutes(grp.Group("/date-slots"), services)
	reservation.ReservationRoutes(grp.Group("/reservations"), services)
	reports.ReportRoutes(grp.Group("/reports"), services)
	user.UserRoutes(grp.Group("/users"), services)
	item.ItemRoutes(grp.Group("/items"), services)
	notification.NotificationRoutes(grp.Group("/notifications"), services)
	searchtag.SearchTagRoutes(grp.Group("/search-tags"), services)
	content.ContentRoutes(grp.Group("/contents"), services)
	extras.ExtrasRoutes(grp.Group("/"), services)
}

func Register(r * gin.Engine, services * services.Services){
	printables.RegisterPrintablesGeneratorRoutes(r.Group("/printables-generator"),services)
	printables.RegisterPrintablesRoutes(r.Group("/printables"), services)
	reports.ReportRendererRoutes(r.Group("/renderer"), services)
	scanner.ScannerRoutes(r.Group("/scanner/"), services)
	billing.BillingRendererRoutes(r.Group("/billing"), services)
}