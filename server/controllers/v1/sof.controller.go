package controllers

// sof = SOURCE OF FUND

import (
	"net/http"
	"slim-app/server/app/http/definitions"

	"github.com/gin-gonic/gin"
)

type FundSourceController struct{}

func (ctrler *FundSourceController) NewSource(ctx *gin.Context) {
	ctx.JSON(definitions.Success(http.StatusOK, gin.H{}, "Source added."))
}
func (ctrler *FundSourceController) GetSources(ctx *gin.Context) {
	ctx.JSON(definitions.Success(http.StatusOK, gin.H{"sources": []gin.H{}}, "Sources fetched."))
}
