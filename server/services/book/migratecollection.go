package book

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)



func (repo * BookController)MigrateCollection(ctx * gin.Context) {

	body := MigrateBody{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindingErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = repo.bookRepository.MigrateCollection(body.SectionId, body.BookIds)
	if err != nil {
		logger.Error(err.Error())
		ctx.JSON(httpresp.Fail500(nil,"Unknown error occured."))
		return
	}
	
	ctx.JSON(httpresp.Success200(nil, "Book Collection Migrated"))
}