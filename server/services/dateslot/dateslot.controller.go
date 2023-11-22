package dateslot

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)


type DateSlot struct {
	dateSlotRepo  repository.DateSlotRepository
}
func NewDateSlotController () DateSlotController {
	return &DateSlot{
		dateSlotRepo: repository.NewDateSlotRepository(),
	}
}
type DateSlotController interface {
	NewSlot(ctx * gin.Context)
	DeleteSlot(ctx * gin.Context)
	GetSlots(ctx * gin.Context)
}
func (ctrler * DateSlot)NewSlot(ctx * gin.Context){
	body := NewSlotBody{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("BindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured"))
		return
	}
	fieldErrs, err := body.Validate()
	if err != nil {
		 ctx.JSON(httpresp.Fail400(gin.H{
			"errors": fieldErrs,
		 }, "Validation error."))
		 return
	}
	dateSlots := body.ToModel()
	err = ctrler.dateSlotRepo.NewSlots(dateSlots)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("NewSlotsError"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "New Slot Created"))
}
func (ctrler * DateSlot)DeleteSlot(ctx * gin.Context) {

}
func (ctrler * DateSlot)GetSlots(ctx * gin.Context){
	slots, err := ctrler.dateSlotRepo.GetSlots()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("getSlotsErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"slots" : slots,
	}, "Slots fetched."))
}