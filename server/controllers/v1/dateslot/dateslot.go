package dateslot

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)


type DateSlot struct {
	services *services.Services
}
func NewDateSlotController (services * services.Services) DateSlotController {
	return &DateSlot{
		services: services,
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
	err = ctrler.services.Repos.DateSlotRepository.NewSlots(dateSlots)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("NewSlotsError"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "New Slot Created"))
}
func (ctrler * DateSlot)DeleteSlot(ctx * gin.Context) {
	id := ctx.Param("id")
	err := ctrler.services.Repos.DateSlotRepository.DeleteSlot(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("DeleteSlotErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Slot deleted."))
}
func (ctrler * DateSlot)GetSlots(ctx * gin.Context){
	requestorApp := ctx.GetString("requestorApp")
	if requestorApp == azuread.ClientAppClientId {
		ctrler.handleGetDateSlotsRequestFromClient(ctx)
		return 
	}
	slots, err := ctrler.services.Repos.DateSlotRepository.GetSlots()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("getSlotsErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"slots" : slots,
	}, "Slots fetched."))
}

func (ctrler * DateSlot)handleGetDateSlotsRequestFromClient(ctx * gin.Context){
	body := DateSlotRange{}
	err := ctx.BindQuery(&body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Success200(gin.H{
			"dateSlots": []struct{}{},
		}, "Slots fetched."))
		return 
	}
	err = body.Validate()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("validateErr"))
		ctx.JSON(httpresp.Success200(gin.H{
			"dateSlots": []struct{}{},
		}, "Slots fetched."))
		return 
	}
	slots, err := ctrler.services.Repos.DateSlotRepository.GetSlotsByRange(body.Start, body.End)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetSlotsByRangeErr"))
	}
	 ctx.JSON(httpresp.Success200(gin.H{
		"dateSlots": slots,
	}, "Slots fetched."))
}