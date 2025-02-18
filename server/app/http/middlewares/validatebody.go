package middlewares

import (
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)
func ValidateBody[Body any](ctx *gin.Context) {
	var body Body
	bindingErr := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if bindingErr != nil {
		ctx.AbortWithStatusJSON(httpresp.Fail(http.StatusBadRequest, gin.H{}, bindingErr.Error()))
		return
	}
	ctx.Next()
}
