package extras

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)


type Extras struct{
	services * services.Services
}
type ExtrasController interface{
	UpdatePolicyPage(ctx  * gin.Context)
	UpdateFAQsPage (ctx  * gin.Context)
	GetFAQsContent(ctx  * gin.Context)
	GetPolicyContent(ctx * gin.Context)
	
}
func NewExtrasController(services * services.Services) ExtrasController {
	return &Extras{
		services: services,
	}
}
func (ctrler * Extras)UpdateFAQsPage(ctx  * gin.Context){
	content :=  model.ExtrasContent{}

	err := ctx.ShouldBindBodyWith(&content, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.services.Repos.ExtrasRepository.UpdateFAQsContent(content)
	if err != nil{ 
		logger.Error(err.Error(), slimlog.Error(err.Error()))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "FAQs updated."))
}

func (ctrler * Extras)GetFAQsContent(ctx  * gin.Context){
	content, err := ctrler.services.Repos.ExtrasRepository.GetFAQsContent()
	if err != nil {
		logger.Error(err.Error())
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"content": content,
	}, "FAQs fetched."))
}

func (ctrler * Extras)UpdatePolicyPage(ctx  * gin.Context){
	content :=  model.ExtrasContent{}

	err := ctx.ShouldBindBodyWith(&content, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.services.Repos.ExtrasRepository.UpdatePolicyContent(content)
	if err != nil{ 
		logger.Error(err.Error(), slimlog.Error(err.Error()))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Policy updated."))
}

func (ctrler * Extras)GetPolicyContent(ctx  * gin.Context){
	content, err := ctrler.services.Repos.ExtrasRepository.GetPolicyContent()
	if err != nil {
		logger.Error(err.Error())
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"content": content,
	}, "Policy fetched."))
}