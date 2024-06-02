package searchtag

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)


func SearchTagRoutes(router * gin.RouterGroup, services * services.Services){
	ctrler := NewSearchTagController(services)
	router.GET("", ctrler.GetSearchTags)
}