package src

import (
	"slim-app/server/app/repository"
	authorsrc "slim-app/server/app/src/v1/author"
	authornumsrc "slim-app/server/app/src/v1/author-number"
	categorysrc "slim-app/server/app/src/v1/category"
	publishersrc "slim-app/server/app/src/v1/publisher"
	sofsrc "slim-app/server/app/src/v1/sof"

	"github.com/gin-gonic/gin"
)

func RegisterRoutesV1(router *gin.Engine, repositories *repository.Repositories) {
	grp := router.Group("/api/1")
	authorsrc.AuthorRoutes(grp.Group("/authors"), repositories)
	publishersrc.PublisherRoutes(grp.Group("/publishers"), repositories)
	sofsrc.FundSourceRoutes(grp.Group("/source-of-funds"), repositories)
	categorysrc.CategoryRoutes(grp.Group("/categories"), repositories)
	authornumsrc.AuthorNumberRoutes(grp.Group("/author-numbers"), repositories)
}
