package routes

import (
	"slim-app/server/controllers"
	routes "slim-app/server/routes/1"

	"github.com/gin-gonic/gin"
)

func RegisterV1(router *gin.Engine) {
	grp := router.Group("/api/1")
	ctrlers := controllers.RegisterV1()
	routes.CategoryRoutes(grp.Group("/categories"), &ctrlers)
	routes.AuthorRoute(grp.Group("/authors"), &ctrlers)
}
