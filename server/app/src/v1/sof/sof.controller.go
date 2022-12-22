package sofsrc

// sof = SOURCE OF FUND

import (
	"net/http"
	"slim-app/server/app/http/httpresp"

	"github.com/gin-gonic/gin"
)

type FundSourceController struct{}

func (ctrler *FundSourceController) NewSource(ctx *gin.Context) {
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{}, "Source added."))
}
func (ctrler *FundSourceController) GetSources(ctx *gin.Context) {
	ctx.JSON(httpresp.Success(http.StatusOK, gin.H{"sources": []gin.H{}}, "Sources fetched."))
}
