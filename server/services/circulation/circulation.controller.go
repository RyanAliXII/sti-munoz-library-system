package circulation

import (
	"slim-app/server/app/http/httpresp"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/repository"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
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
func (ctrler *CirculationController) GetTransactionById(ctx *gin.Context) {
	id := ctx.Param("id")
	_, err := uuid.Parse(id)
	if err != nil {
		logger.Warn("Invalid UUID value", slimlog.Function("CirculationController.GetTransactionById"), zap.String("uuid", id))
		ctx.JSON(httpresp.Fail404(nil, "Invalid id param."))
		return
	}
	transaction := ctrler.repos.CirculationRepository.GetBorrowingTransactionById(id)
	if len(transaction.Id) == 0 {
		ctx.JSON(httpresp.Fail404(nil, "Transaction not found."))
		return
	}

	ctx.JSON(httpresp.Success200(gin.H{
		"transaction": transaction,
	}, "Transaction fetched."))
}
func NewCirculationController(repos *repository.Repositories) CirculationControllerInterface {
	return &CirculationController{
		repos: repos,
	}
}

type CirculationControllerInterface interface {
	GetTransactions(ctx *gin.Context)
	GetTransactionBooks(ctx *gin.Context)
	GetTransactionById(ctx *gin.Context)
}
