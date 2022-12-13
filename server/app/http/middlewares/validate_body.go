package middlewares

import (
	"net/http"
	"slim-app/server/app/http/definitions"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

func ValidateBody[Body any](ctx *gin.Context) {
	var body Body
	bindingErr := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if bindingErr != nil {
		ctx.AbortWithStatusJSON(definitions.Fail(http.StatusBadRequest, gin.H{}, bindingErr.Error()))
		return
	}
	ctx.Next()
}
