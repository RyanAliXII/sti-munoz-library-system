package src

import (
	"slim-app/server/app/repository"
	authorsrc "slim-app/server/app/src/v1/author"
	categorysrc "slim-app/server/app/src/v1/category"

	"github.com/gin-gonic/gin"
)

func RegisterRoutesV1(router *gin.Engine, repositories *repository.Repositories) {
	grp := router.Group("/api/1")
	authorsrc.AuthorRoutes(grp.Group("/authors"), repositories)
	categorysrc.CategoryRoutes(grp.Group("/categories"))

}
