package timeslot

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)


type TimeSlot struct{
	services * services.Services
}

type TimeSlotController interface{
	NewTimeSlot(ctx * gin.Context)
	UpdateTimeSlot(ctx * gin.Context)
	DeleteTimeSlot(ctx * gin.Context)
	GetTimeSlotBasedOnDateAndDevice(ctx * gin.Context)
}
func NewTimeSlotController (services * services.Services) TimeSlotController{
	return &TimeSlot{
		services: services,
	}
}
func(ctrler * TimeSlot)NewTimeSlot(ctx * gin.Context){
	profileId := ctx.Param("id")
	slot := model.TimeSlot{}
	err := ctx.ShouldBindBodyWith(&slot, binding.JSON)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("BindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	slot.ProfileId = profileId
	fields, err := ctrler.services.Validator.TimeSlotValidator.Validate(&slot)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("ValidationErr"))
		ctx.JSON(httpresp.Fail400(gin.H{
			"errors": fields,
		}, "Validation err"))
		return
	}

	err = ctrler.services.Repos.TimeSlotRepository.NewSlot(slot)
	if err != nil{
		ctrler.services.Logger.Error(err.Error(), applog.Error("NewSlotErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Slot created."))
}

func(ctrler * TimeSlot)UpdateTimeSlot(ctx * gin.Context){
	profileId := ctx.Param("id")
	slotId := ctx.Param("slotId")
	slot := model.TimeSlot{}
	err := ctx.ShouldBindBodyWith(&slot, binding.JSON)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("BindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	slot.ProfileId = profileId
	slot.Id = slotId
	fields, err := ctrler.services.Validator.TimeSlotValidator.ValidateUpdate(&slot)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("ValidationErr"))
		ctx.JSON(httpresp.Fail400(gin.H{
			"errors": fields,
		}, "Validation err"))
		return
	}
	
	err = ctrler.services.Repos.TimeSlotRepository.UpdateSlot(slot)
	if err != nil{
		ctrler.services.Logger.Error(err.Error(), applog.Error("UpdateSlotErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Slot updated."))
}

func(ctrler * TimeSlot)DeleteTimeSlot(ctx * gin.Context){
	profileId := ctx.Param("id")
	slotId := ctx.Param("slotId")
	slot := model.TimeSlot{}
	slot.ProfileId = profileId
	slot.Id = slotId
	err := ctrler.services.Repos.TimeSlotRepository.DeleteSlot(slot)
	if err != nil{
		ctrler.services.Logger.Error(err.Error(), applog.Error("DeleteSlotErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Slot deleted."))
}

func (ctrler * TimeSlot)GetTimeSlotBasedOnDateAndDevice(ctx * gin.Context){
	profileId := ctx.Param("id")
	dateSlotId := ctx.Param("dateSlotId")
	deviceId := ctx.Param("deviceId")
	accountId := ctx.GetString("requestorId")
	slots, err := ctrler.services.Repos.TimeSlotRepository.GetTimeSlotBasedOnDateAndDevice(profileId, dateSlotId, deviceId)
    if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("GetTimeSlotBasedOnDateAndDevice"))
	}
	reservations, err := ctrler.services.Repos.ReservationRepository.GetReservationByClientAndDateSlot(accountId, dateSlotId)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("GetReservationErr") )
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"timeSlots": slots,
		"reservations": reservations,
	}, "Slots fetched."))
}