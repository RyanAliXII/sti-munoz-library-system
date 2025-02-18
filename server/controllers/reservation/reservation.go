package reservation

import (
	"fmt"
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/status"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type Reservation struct {
	services * services.Services
}

func NewReservationController (services * services.Services) ReservationController {
	return &Reservation{
		services: services,
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
		ctrler.services.Logger.Error(err.Error(), applog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	}
	reservation.AccountId = ctx.GetString("requestorId")
	err = ctrler.services.Repos.ReservationRepository.NewReservation(reservation)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("NewReservationErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	account, err  := ctrler.services.Repos.AccountRepository.GetAccountByIdDontIgnoreIfDeletedOrInactive(reservation.AccountId)
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
	}
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
	}
	message := fmt.Sprintf("%s %s has reserved a device.", account.GivenName, account.Surname)
	accountIds, err := ctrler.services.Repos.NotificationRepository.NotifyAdminsWithPermission(model.AdminNotification{
		Message: message,
		Link: "/services/reservations",
		
	}, "Reservation.Read")
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
	}
	for _, accountId := range accountIds{
		routingKey := fmt.Sprintf("notify_admin_%s",  accountId)
		err := ctrler.services.Broadcaster.Broadcast("notification",  routingKey, []byte(message))
		if err != nil{
			ctrler.services.Logger.Error(err.Error())
		}
	}
	
	ctx.JSON(httpresp.Success200(nil, "Reservation created."))
}
func (ctrler * Reservation)GetReservations(ctx * gin.Context){
   
	requestorApp := ctx.GetString("requestorApp")
	if requestorApp == ctrler.services.Config.ClientAppClientID{
		accountId := ctx.GetString("requestorId")
		reservations, err :=ctrler.services.Repos.ReservationRepository.GetReservationsByClientId(accountId)
		if err != nil {
			ctrler.services.Logger.Error(err.Error(), applog.Error("GetReservationsErr"))
		}
		ctx.JSON(httpresp.Success200(gin.H{
			"reservations": reservations,
		}, "Reservations fetched for client."))
		return
	}
	filter := ReservationFilter{}
	filter.ExtractFilter(ctx)
	reservations, metadata, err := ctrler.services.Repos.ReservationRepository.GetReservations(&repository.ReservationFilter{
		From: filter.From,
		To: filter.To,
		Status: filter.Status,
		Devices: filter.Devices,
		SortBy: filter.SortBy,
		Order: filter.Order,
		Filter: filter.Filter,
	})
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("GetReservationsErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"reservations": reservations,
		"metadata": metadata,
	}, "Reservations fetched."))
}
func (ctrler * Reservation)UpdateStatus(ctx * gin.Context){
	id := ctx.Param("id")
	statusId, err  := strconv.Atoi(ctx.Query("statusId"))
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("convErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}

	requestorApp := ctx.GetString("requestorApp")
	if requestorApp == ctrler.services.Config.ClientAppClientID{
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
		ctrler.services.Logger.Error(err.Error(), applog.Error("editRemarksErr"))
		ctx.JSON(httpresp.Success200(nil, "Reservation repo"))
		return
	}
	err = ctrler.services.Repos.ReservationRepository.UpdateRemarks(id, body.Remarks)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("EditRemarksErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Reservation edit remarks."))
}
func(ctrler * Reservation)handleUpdateStatusRequestFromClient(ctx * gin.Context, id string) {
	body := CancellationBody{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("CancellationErr"))
		ctx.JSON(httpresp.Success200(nil, "Reservation repo"))
		return
	}
	err = body.Validate()
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("validateErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
	}
	accountId := ctx.GetString("requestorId")
	err = ctrler.services.Repos.ReservationRepository.CancelReservationByClientAndId(id, accountId, body.Remarks)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("CancelErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Reservation cancelled."))
}
func (ctrler * Reservation)handleMarkAsAttended(ctx * gin.Context, id string){
	err := ctrler.services.Repos.ReservationRepository.MarkAsAttended(id)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("MarkAsAttendedErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Reservation mark as attended."))
}
func (ctrler * Reservation)handleMarkAsMissed(ctx * gin.Context, id string){
	err := ctrler.services.Repos.ReservationRepository.MarkAsMissed(id)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("MarkAsMissedErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Reservation mark as missed."))
}
func (ctrler * Reservation)handleCancellation(ctx * gin.Context, id string){
		body := CancellationBody{}
		err := ctx.ShouldBindBodyWith(&body, binding.JSON)
		if err != nil {
			ctrler.services.Logger.Error(err.Error(), applog.Error("CancellationErr"))
			ctx.JSON(httpresp.Success200(nil, "Reservation repo"))
			return
		}
		err = ctrler.services.Repos.ReservationRepository.CancelReservation(id, body.Remarks)
		if err != nil {
			ctrler.services.Logger.Error(err.Error(), applog.Error("CancelErr"))
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
			return
		}
		ctx.JSON(httpresp.Success200(nil, "Reservation cancelled."))
}