package billing

import (
	"database/sql"
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)

type Billing struct {
	services * services.Services
}
type  BillingController interface {
	RenderBillByPenaltyId (ctx * gin.Context )
}
func (ctrler * Billing)RenderBillByPenaltyId(ctx * gin.Context){
	id := ctx.Param("id")
	penalty, err := ctrler.services.Repos.PenaltyRepository.GetPenaltyById(id)
	if err != nil {
		ctrler.services.Logger.Info(err.Error(), applog.Error("GetPenaltyByIdErr"))
		if err == sql.ErrNoRows {
			ctx.AbortWithStatus(http.StatusNotFound)
			return 
		}
		ctx.AbortWithStatus(http.StatusInternalServerError)
		return 
	}
	ctx.HTML(http.StatusOK, "billing/penalty/index", gin.H{
		"penalty": penalty,
	})
}

func NewBillingRenderer(services * services.Services) BillingController {
	return &Billing{
		services: services,
	}
}