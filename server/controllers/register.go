package controllers

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/accessionnumber"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/account"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/author"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/authornumber"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/bag"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/billing"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/book"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/borrowing"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/clientlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/content"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/dateslot"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/ddc"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/device"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/extras"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/game"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/inventory"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/item"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/notification"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/penalty"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/printables"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/publisher"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/reports"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/reservation"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/scanner"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/searchtag"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/section"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/stats"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/system"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/timeslot"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/user"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
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
	accessionnumber.AccessionNumberRoutes(grp.Group("/accession-numbers"), services)
}

func Register(r * gin.Engine, services * services.Services){
	printables.RegisterPrintablesGeneratorRoutes(r.Group("/printables-generator"),services)
	printables.RegisterPrintablesRoutes(r.Group("/printables"), services)
	reports.ReportRendererRoutes(r.Group("/renderer"), services)
	scanner.ScannerRoutes(r.Group("/scanner/"), services)
	billing.BillingRendererRoutes(r.Group("/billing"), services)
}