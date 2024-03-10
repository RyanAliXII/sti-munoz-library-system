package reservation

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

func ReservationRoutes (router * gin.RouterGroup, services * services.Services) {
	ctrler := NewReservationController(services)
	router.POST("", middlewares.ValidateBody[ReservationBody], ctrler.NewReservation)
	router.GET("", ctrler.GetReservations)
	router.PATCH("/:id/status", ctrler.UpdateStatus)
}