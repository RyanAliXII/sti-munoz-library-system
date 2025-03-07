package book

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)



func (ctrler *Book)MigrateCollection(ctx * gin.Context) {

	body := MigrateBody{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("bindingErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.services.Repos.BookRepository.MigrateCollection(body.SectionId, body.BookIds)
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
		ctx.JSON(httpresp.Fail500(nil,"Unknown error occured."))
		return
	}
	
	ctx.JSON(httpresp.Success200(nil, "Book Collection Migrated"))
}