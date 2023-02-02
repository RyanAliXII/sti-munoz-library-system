package circulation

import (
	"slim-app/server/repository"

	"github.com/gin-gonic/gin"
)

func CirculationRoutes(router *gin.RouterGroup, repos *repository.Repositories) {
	var controller CirculationControllerInterface = NewCirculationController(repos)
	router.GET("/transactions", controller.GetTransactions)
	router.GET("/transactions/:id/books", controller.GetTransactionBooks)

}
