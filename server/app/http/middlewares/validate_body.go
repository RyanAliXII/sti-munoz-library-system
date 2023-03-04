package middlewares

import (
	"net/http"
	"slim-app/server/app/http/httpresp"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"go.uber.org/zap"
)

func ValidateBody[Body any](ctx *gin.Context) {
	var body Body
	bindingErr := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if bindingErr != nil {
		logger.Error(bindingErr.Error(), zap.String("func", "middlewares.ValidateBody"))
		ctx.AbortWithStatusJSON(httpresp.Fail(http.StatusBadRequest, gin.H{}, bindingErr.Error()))
		return
	}
	ctx.Next()
}
