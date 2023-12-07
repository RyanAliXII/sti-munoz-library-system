package book

import (
	"fmt"

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
	fmt.Println(body)
	ctx.JSON(httpresp.Success200(nil, "Book Collection Migrated"))
}