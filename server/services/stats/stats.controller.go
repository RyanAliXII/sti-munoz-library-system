package stats

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"

	"github.com/gin-gonic/gin"
)




type StatsController struct {
	statsRepo repository.StatsRepositoryInterface


}
func (ctrler *StatsController) GetLibraryStats(ctx *gin.Context) {
	stats := ctrler.statsRepo.GetLibraryStats()
	weeklyWalkIns, err := ctrler.statsRepo.GetWeeklyLogs()
	if err != nil {
		logger.Error(err.Error())
	}
	monthlyWalkIns, err :=  ctrler.statsRepo.GetMonthlyLogs()
	if err != nil {
		logger.Error(err.Error())
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"stats": stats,
		"monthlyWalkIns": monthlyWalkIns,
		"weeklyWalkIns": weeklyWalkIns,
	}, "Library Stats has been fetched."))
}

func NewStatsController() StatsControllerInterface {
	return &StatsController{
		statsRepo:  repository.NewStatsRepository(),
	}
}

type StatsControllerInterface interface {

	GetLibraryStats(ctx *gin.Context)

}