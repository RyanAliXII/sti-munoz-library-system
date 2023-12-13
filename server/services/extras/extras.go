package extras

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)


type Extras struct{
	extrasRepo repository.ExtrasRepository
}
type ExtrasController interface{
	UpdateLibraryPolicPage (ctx * gin.Context) 
	UpdateFAQsPage (ctx  * gin.Context)
	GetFAQsContent(ctx  * gin.Context)
}
func NewExtrasController() ExtrasController {
	return &Extras{
		extrasRepo: repository.NewExtrasRepository(),
	}
}
func (ctrler * Extras)UpdateLibraryPolicPage(ctx * gin.Context) {
	
}
func (ctrler * Extras)UpdateFAQsPage(ctx  * gin.Context){
	content :=  model.ExtrasContent{}

	err := ctx.ShouldBindBodyWith(&content, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.extrasRepo.UpdateFAQsContent(content)
	if err != nil{ 
		logger.Error(err.Error(), slimlog.Error(err.Error()))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "FAQs updated."))
}

func (ctrler * Extras)GetFAQsContent(ctx  * gin.Context){
	content, err := ctrler.extrasRepo.GetFAQsContent()
	if err != nil {
		logger.Error(err.Error())
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"content": content,
	}, "FAQs updated."))
}