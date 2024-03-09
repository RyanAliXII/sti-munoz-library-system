package searchtag

import "github.com/gin-gonic/gin"


func SearchTagRoutes(router * gin.RouterGroup){
	ctrler := NewSearchTagController()
	router.GET("", ctrler.GetSearchTags)
}