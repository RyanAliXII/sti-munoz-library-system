package reservation

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/middlewares"
	"github.com/gin-gonic/gin"
)

func ReservationRoutes (router * gin.RouterGroup) {

	ctrler := NewReservationController()

	router.POST("", middlewares.ValidateBody[ReservationBody], ctrler.NewReservation)
}