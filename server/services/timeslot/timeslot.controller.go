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
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Slot created successfully."))
}

func (ctrler * TimeSlot)GetSlots( ctx * gin.Context) {
	_, err  := ctrler.timeSlotRepo.GetSlots()
	if err != nil {

		logger.Error("")
	}
}