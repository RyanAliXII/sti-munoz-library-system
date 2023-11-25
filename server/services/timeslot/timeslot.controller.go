package timeslot

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)


type TimeSlot struct{
	timeSlotRepo repository.TimeSlotRepository
}

type TimeSlotController interface{
	NewTimeSlot(ctx * gin.Context)
	UpdateTimeSlot(ctx * gin.Context)
	DeleteTimeSlot(ctx * gin.Context)
	GetTimeSlotBasedOnDateAndDevice(ctx * gin.Context)
}
func NewTimeSlotController () TimeSlotController{
	return &TimeSlot{
		timeSlotRepo: repository.NewTimeSlotRepository(),
	}
}
func(ctrler * TimeSlot)NewTimeSlot(ctx * gin.Context){
	profileId := ctx.Param("id")
	slot := model.TimeSlot{}
	err := ctx.ShouldBindBodyWith(&slot, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("BindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	slot.ProfileId = profileId
	fields, err := slot.Validate()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("ValidationErr"))
		ctx.JSON(httpresp.Fail400(gin.H{
			"errors": fields,
		}, "Validation err"))
		return
	}
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("ValidateTime"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	}
	err = ctrler.timeSlotRepo.NewSlot(slot)
	if err != nil{
		logger.Error(err.Error(), slimlog.Error("NewSlotErr"))
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
		logger.Error(err.Error(), slimlog.Error("BindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	slot.ProfileId = profileId
	slot.Id = slotId
	fields, err := slot.ValidateUpdate()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("ValidationErr"))
		ctx.JSON(httpresp.Fail400(gin.H{
			"errors": fields,
		}, "Validation err"))
		return
	}
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("ValidateTime"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	}
	err = ctrler.timeSlotRepo.UpdateSlot(slot)
	if err != nil{
		logger.Error(err.Error(), slimlog.Error("UpdateSlotErr"))
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
	err := ctrler.timeSlotRepo.DeleteSlot(slot)
	if err != nil{
		logger.Error(err.Error(), slimlog.Error("DeleteSlotErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Slot deleted."))
}


// func (ctrler * TimeSlot)GetSlots( ctx * gin.Context) {
// 	_, err  := ctrler.timeSlotRepo.GetSlots()
// 	if err != nil {

// 		logger.Error("")
// 	}
// }
func (ctrler * TimeSlot)GetTimeSlotBasedOnDateAndDevice(ctx * gin.Context){
	profileId := ctx.Param("id")
	dateSlotId := ctx.Param("dateSlotId")
	deviceId := ctx.Param("deviceId")
	slots, err := ctrler.timeSlotRepo.GetTimeSlotBasedOnDateAndDevice(profileId, dateSlotId, deviceId)
    if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetTimeSlotBasedOnDateAndDevice"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"timeSlots": slots,
	}, "Slots fetched."))
}