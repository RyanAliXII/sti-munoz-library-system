package reservation

import (
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/status"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)



type Reservation struct {
	reservationRepo repository.ReservationRepository
	accountRepo repository.AccountRepositoryInterface
}

func NewReservationController () ReservationController {
	return &Reservation{
		reservationRepo: repository.NewReservationRepository(),
		accountRepo : repository.NewAccountRepository(),
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
	_, err  = ctrler.accountRepo.GetAccountByIdDontIgnoreIfDeletedOrInactive(reservation.AccountId)
	if err != nil {
		logger.Error(err.Error())
	}

	if err != nil {
		logger.Error(err.Error())
	}
	ctx.JSON(httpresp.Success200(nil, "Reservation created."))
}
func (ctrler * Reservation)GetReservations(ctx * gin.Context){

	requestorApp := ctx.GetString("requestorApp")
	if requestorApp == azuread.ClientAppClientId{
		accountId := ctx.GetString("requestorId")
		reservations, err := ctrler.reservationRepo.GetReservationsByClientId(accountId)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("GetReservationsErr"))
		}
		ctx.JSON(httpresp.Success200(gin.H{
			"reservations": reservations,
		}, "Reservations fetched for client."))
		return
	}
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

	requestorApp := ctx.GetString("requestorApp")
	if requestorApp == azuread.ClientAppClientId{
		ctrler.handleUpdateStatusRequestFromClient(ctx, id)
		return
	}
	switch(statusId){
		case 0:
			ctrler.handleEditRemarks(ctx, id)
			return
		case status.ReservationStatusAttended:
			ctrler.handleMarkAsAttended(ctx, id)
			return
		case status.ReservationStatusMissed:
			ctrler.handleMarkAsMissed(ctx, id)
			return
		case status.ReservationStatusCancelled:
			ctrler.handleCancellation(ctx, id)
			return
	}
	
	 ctx.JSON(httpresp.Success200(nil, "Invalid action."))
}
func(ctrler * Reservation)handleEditRemarks(ctx * gin.Context, id string) {
	body := CancellationBody{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("editRemarksErr"))
		ctx.JSON(httpresp.Success200(nil, "Reservation repo"))
		return
	}
	err = ctrler.reservationRepo.UpdateRemarks(id, body.Remarks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("EditRemarksErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Reservation edit remarks."))
}
func(ctrler * Reservation)handleUpdateStatusRequestFromClient(ctx * gin.Context, id string) {
	body := CancellationBody{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("CancellationErr"))
		ctx.JSON(httpresp.Success200(nil, "Reservation repo"))
		return
	}
	err = body.Validate()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("validateErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
	}
	accountId := ctx.GetString("requestorId")
	err = ctrler.reservationRepo.CancelReservationByClientAndId(id, accountId, body.Remarks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("CancelErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Reservation cancelled."))
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
func (ctrler * Reservation)handleCancellation(ctx * gin.Context, id string){
		body := CancellationBody{}
		err := ctx.ShouldBindBodyWith(&body, binding.JSON)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("CancellationErr"))
			ctx.JSON(httpresp.Success200(nil, "Reservation repo"))
			return
		}
		err = ctrler.reservationRepo.CancelReservation(id, body.Remarks)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("CancelErr"))
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
			return
		}
		ctx.JSON(httpresp.Success200(nil, "Reservation cancelled."))
}