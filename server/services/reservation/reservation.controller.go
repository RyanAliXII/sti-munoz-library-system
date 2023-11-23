package reservation

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)



type Reservation struct {
	reservationRepo repository.ReservationRepository
}

func NewReservationController () ReservationController {
	return &Reservation{
		reservationRepo: repository.NewReservationRepository(),
	}
}
type ReservationController interface {
	NewReservation(ctx * gin.Context)
}
func(ctrler  * Reservation)NewReservation(ctx * gin.Context){
	reservation := model.Reservation{}
	err := ctx.ShouldBindBodyWith(&reservation, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	}
	reservation.AccountId = ctx.GetString("requestorId")
	err = ctrler.reservationRepo.NewReservation(reservation)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("NewReservationErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Reservation created."))
}