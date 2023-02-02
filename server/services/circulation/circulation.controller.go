package circulation

import (
	"slim-app/server/app/http/httpresp"
	"slim-app/server/repository"

	"github.com/gin-gonic/gin"
)

type CirculationController struct {
	repos *repository.Repositories
}

func (ctrler *CirculationController) GetTransactions(ctx *gin.Context) {
	transactions := ctrler.repos.CirculationRepository.GetBorrowingTransactions()
	ctx.JSON(httpresp.Success200(gin.H{"transactions": transactions}, "Transactions fetched."))
}
func (ctrler *CirculationController) GetTransactionBooks(ctx *gin.Context) {
	ctx.JSON(httpresp.Success200(nil, "Borrowed books fetched."))
}

func NewCirculationController(repos *repository.Repositories) CirculationControllerInterface {
	return &CirculationController{
		repos: repos,
	}
}

type CirculationControllerInterface interface {
	GetTransactions(ctx *gin.Context)
	GetTransactionBooks(ctx *gin.Context)
}
