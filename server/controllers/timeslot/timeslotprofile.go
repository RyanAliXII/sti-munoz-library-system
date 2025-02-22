package timeslot

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type TimeSlotProfile struct {
	services * services.Services
}
func NewTimeSlotProfileController(services * services.Services) TimeSlotProfileController {
	return &TimeSlotProfile{
		services: services,
	}
}
type TimeSlotProfileController interface {
	NewProfile(ctx * gin.Context)
	UpdateProfile(ctx * gin.Context)
	DeleteProfile(ctx * gin.Context)
	GetProfiles(ctx * gin.Context)
	GetProfileById(ctx * gin.Context)
}
func(ctrler * TimeSlotProfile)NewProfile(ctx * gin.Context){
	body := model.TimeSlotProfile{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.services.Repos.TimeSlotProfileRepository.NewProfile(body)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("NewProfileErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Profile created."))
}
func(ctrler * TimeSlotProfile)UpdateProfile(ctx * gin.Context){
	id := ctx.Param("id")
	profile := model.TimeSlotProfile{}

	err := ctx.ShouldBindBodyWith(&profile, binding.JSON)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	profile.Id = id
	err = ctrler.services.Repos.TimeSlotProfileRepository.UpdateProfile(profile)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("UpdateProfileErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Profile updated."))
}
func(ctrler * TimeSlotProfile)DeleteProfile(ctx * gin.Context){
	id := ctx.Param("id")
	err := ctrler.services.Repos.TimeSlotProfileRepository.DeleteProfile(id)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("DeleteProfileErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Profile deleted."))
}
func(ctrler * TimeSlotProfile)GetProfiles(ctx * gin.Context){
	profiles, err :=ctrler.services.Repos.TimeSlotProfileRepository.GetProfiles()
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("GetProfilesErr"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"profiles": profiles,
	}, "Profiles fetched"))
}
func(ctrler * TimeSlotProfile)GetProfileById(ctx * gin.Context){
	id := ctx.Param("id")
	profile, err := ctrler.services.Repos.TimeSlotProfileRepository.GetProfileById(id)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error(err.Error()))
		ctx.JSON(httpresp.Fail404(nil, "Not found."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"profile": profile,
	}, "Profile fetched."))
}