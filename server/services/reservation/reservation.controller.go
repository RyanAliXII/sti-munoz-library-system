package reservation

import (
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/status"
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
	GetReservations(ctx * gin.Context)
	UpdateStatus(ctx  * gin.Context) 
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
func (ctrler * Reservation)GetReservations(ctx * gin.Context){
	reservations, err := ctrler.reservationRepo.GetReservations()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetReservationsErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"reservations": reservations,
	}, "Reservations fetched."))
}
func (ctrler * Reservation)UpdateStatus(ctx * gin.Context){
	id := ctx.Param("id")
	statusId, err  := strconv.Atoi(ctx.Query("statusId"))
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("convErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	switch(statusId){
		case status.ReservationStatusAttended:
			ctrler.handleMarkAsAttended(ctx, id)
			return
		case status.ReservationStatusMissed:
			ctrler.handleMarkAsMissed(ctx, id)
			return
	}	
	 ctx.JSON(httpresp.Fail400(nil, "Invalid action."))
}
func (ctrler * Reservation)handleMarkAsAttended(ctx * gin.Context, id string){
	err := ctrler.reservationRepo.MarkAsAttended(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAsAttendedErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Reservation mark as attended."))
}
func (ctrler * Reservation)handleMarkAsMissed(ctx * gin.Context, id string){
	err := ctrler.reservationRepo.MarkAsMissed(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("MarkAsMissedErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Reservation mark as missed."))
}