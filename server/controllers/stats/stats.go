package stats

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/gin-gonic/gin"
)

type Stats struct {
	services * services.Services
}
func (ctrler *Stats) GetLibraryStats(ctx *gin.Context) {
	stats := ctrler.services.Repos.StatsRepository.GetLibraryStats()
	weeklyWalkIns, err := ctrler.services.Repos.StatsRepository.GetWeeklyLogs()
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
	}
	monthlyWalkIns, err :=  ctrler.services.Repos.StatsRepository.GetMonthlyLogs()
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
	}
	weeklyBorrowedSection, err :=ctrler.services.Repos.StatsRepository.GetWeeklyBorrowedSection()
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
	}
	monthlyBorrowedSection, err := ctrler.services.Repos.StatsRepository.GetMonthlyBorrowedSection()
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
	}

	stats.MonthlyWalkIns = monthlyWalkIns
	stats.WeeklyWalkIns = weeklyWalkIns
     stats.MonthlyBorrowedSection = monthlyBorrowedSection
	 stats.WeeklyBorrowedSection = weeklyBorrowedSection
	ctx.JSON(httpresp.Success200(gin.H{
		"stats": stats,
	}, "Library Stats has been fetched."))
}

func NewStatsController(services * services.Services) StatsController{
	return &Stats{
		services: services,
	}
}

type StatsController interface {

	GetLibraryStats(ctx *gin.Context)

}