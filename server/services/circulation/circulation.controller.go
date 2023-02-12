package circulation

import (
	"slim-app/server/app/http/httpresp"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/model"
	"slim-app/server/repository"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/google/uuid"
	"github.com/jinzhu/copier"
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
func (ctrler *CirculationController) Checkout(ctx *gin.Context) {
	body := CheckoutBody{}
	ctx.ShouldBindBodyWith(&body, binding.JSON)
	var accessions []model.Accession = make([]model.Accession, 0)
	copyErr := copier.Copy(&accessions, &body.Accessions)
	if copyErr != nil {
		logger.Error(copyErr.Error(), slimlog.Function("CirculationController.Checkout"))
		ctx.JSON(httpresp.Fail400(nil, "Checkout failed."))
		return
	}
	newTransactionErr := ctrler.repos.CirculationRepository.NewTransaction(body.ClientId, body.DueDate, accessions)
	if newTransactionErr != nil {
		ctx.JSON(httpresp.Fail400(nil, "Something went wrong."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Checkout success."))
}

func (ctrler *CirculationController) ReturnBooksById(ctx *gin.Context) {

	id := ctx.Param("id")
	_, idParseErr := uuid.Parse(id)
	body := ReturnBookBody{
		Remarks: "",
	}

	ctx.ShouldBindBodyWith(&body, binding.JSON)
	if idParseErr != nil {
		logger.Error(idParseErr.Error(), slimlog.Function("CirculationController.ReturnBooksById"), zap.String("id", id))
		ctx.JSON(httpresp.Fail400(nil, "Invalid id param."))
		return
	}

	returnErr := ctrler.repos.CirculationRepository.ReturnBooksByTransactionId(id, body.Remarks)
	if returnErr != nil {
		ctx.JSON(httpresp.Fail400(nil, returnErr.Error()))
		return
	}

	ctx.JSON(httpresp.Success200(nil, "Books returned successfully."))
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
	Checkout(ctx *gin.Context)
	ReturnBooksById(ctx *gin.Context)
}
