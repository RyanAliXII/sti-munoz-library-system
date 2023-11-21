package timeslot

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)



type TimeSlotProfile struct {
	timeSlotProfileRepo repository.TimeSlotProfileRepository
}
func NewTimeSlotProfileController() TimeSlotProfileController {
	return &TimeSlotProfile{
		timeSlotProfileRepo: repository.NewTimeSlotProfileRepository(),
	}
}
type TimeSlotProfileController interface {
	NewProfile(ctx * gin.Context)
	UpdateProfile(ctx * gin.Context)
	DeleteProfile(ctx * gin.Context)
	GetProfiles(ctx * gin.Context)
}
func(ctrler * TimeSlotProfile)NewProfile(ctx * gin.Context){
	body := model.TimeSlotProfile{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.timeSlotProfileRepo.NewProfile(body)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("NewProfileErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Profile created successfully."))
}
func(ctrler * TimeSlotProfile)UpdateProfile(ctx * gin.Context){

}
func(ctrler * TimeSlotProfile)DeleteProfile(ctx * gin.Context){

}
func(ctrler * TimeSlotProfile)GetProfiles(ctx * gin.Context){
	profiles, err := ctrler.timeSlotProfileRepo.GetProfiles()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetProfilesErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"profiles": profiles,
	}, "Profiles fetched"))
}