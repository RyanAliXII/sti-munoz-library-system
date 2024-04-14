package penalty

import (
	"bytes"
	"fmt"
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/browser"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-rod/rod/lib/proto"
	"github.com/ysmood/gson"
)
type Penalty struct{
	services * services.Services
}
func (ctrler * Penalty) GetPenalties (ctx * gin.Context){
	requestorApp := ctx.GetString("requestorApp")
	if requestorApp == azuread.AdminAppClientId {
		filter := NewPenaltyFilter(ctx)
		penalties, metadata, err := ctrler.services.Repos.PenaltyRepository.GetPenalties(&repository.PenaltyFilter{
			From: filter.From,
			To: filter.To,
			Status: filter.Status,
			Min: filter.Min,
			Max: filter.Max,
			Order: filter.Order,
			SortBy: filter.SortBy,
			Filter: filter.Filter,
		})
		if err != nil {
			ctrler.services.Logger.Error(err.Error(), slimlog.Error("GetPenaltiesErr"))
		}
		ctx.JSON(httpresp.Success200(gin.H{
				"penalties": penalties,
				"metadata": metadata,
		}, "penalties has been fetched."))
		return
	}
	if requestorApp == azuread.ClientAppClientId{
		requestorId := ctx.GetString("requestorId")
		penalties, err := ctrler.services.Repos.PenaltyRepository.GetPenaltiesByAccountId(requestorId)
		if err != nil {
			ctrler.services.Logger.Error(err.Error(), slimlog.Error("GetPenaltiesByAccountId"))
		}
		ctx.JSON(httpresp.Success200(gin.H{
			"penalties": penalties,
		}, "Penalties fetched."))
		return
	}
	ctx.JSON(httpresp.Fail500(nil, "Unknown error occured please try again later."))
}

func (ctrler * Penalty)UpdatePenaltySettlement(ctx *gin.Context){
	penaltyId := ctx.Param("id")
	body := SettlePenaltyBody{}
	err := ctx.Bind(&body)
	isUpdate := ctx.Query("isUpdate")

	if isUpdate == "true"{
		err := ctrler.services.Repos.PenaltyRepository.UpdateSettlement(penaltyId, body.Proof, body.Remarks)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("UpdateSettlement"))
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
			return 
		}
		ctx.JSON(httpresp.Success200(nil, "Settlement has been updated."))
		return
	}
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("BindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	}
	err = ctrler.services.Repos.PenaltyRepository.MarkAsSettled(penaltyId, body.Proof, body.Remarks)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("	MarkAsSettled"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Settlement has been updated."))

}
func (ctrler * Penalty)AddPenalty(ctx * gin.Context){
    penalty := model.Penalty{}
	ctx.ShouldBindBodyWith(&penalty, binding.JSON)
	addErr := ctrler.services.Repos.PenaltyRepository.AddPenalty(penalty)
	if addErr!= nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured please try again later."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Penalty has been added."))
}
func (ctrler * Penalty)UpdatePenalty(ctx * gin.Context){
    penalty := model.Penalty{}
	ctx.ShouldBindBodyWith(&penalty, binding.JSON)
	addErr := ctrler.services.Repos.PenaltyRepository.UpdatePenalty(penalty)
	if addErr!= nil {
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured please try again later."))
			return
	}
	ctx.JSON(httpresp.Success200(nil, "Penalty has been added."))
}
func(ctrler * Penalty)GetBill(ctx * gin.Context){
	id := ctx.Param("id")
	browser, err := browser.NewBrowser()

	if err != nil {
		logger.Error(err.Error(), slimlog.Error("NewBrowserErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	url := fmt.Sprintf("http://localhost:5200/billing/penalty/%s",  id)
	page := browser.GetPageFromPool()
	defer browser.ReturnPageToPool(page)
	err = page.Navigate(url)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("NavigateErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	err = page.WaitLoad()
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("waitLoadErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	pdf, err := page.PDF( &proto.PagePrintToPDF{
		PaperWidth:  gson.Num(8.5),
		PaperHeight: gson.Num(11),
		
	})
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("PDFError"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	var buffer bytes.Buffer
	_, err = buffer.ReadFrom(pdf)
	if err != nil {
		logger.Error(err.Error())
	}
	ctx.Data(http.StatusOK, "application/pdf", buffer.Bytes())
}
func(ctrler * Penalty)ExportPenalties(ctx * gin.Context){
	fileType := ctx.Query("fileType")
	filter := NewPenaltyFilter(ctx)
	repoFilter := &repository.PenaltyFilter{
		From: filter.From,
		To: filter.To,
		Status: filter.Status,
		Min: filter.Min,
		Max: filter.Max,
		Order: filter.Order,
		SortBy: filter.SortBy,
		Filter: filter.Filter,
	}
	if fileType == ".csv"{
		data, err := ctrler.services.Repos.PenaltyRepository.GetPenaltyCSVData(repoFilter)
		if err != nil {
			ctrler.services.Logger.Error(err.Error(), slimlog.Error("GetPenaltyCSVData"))
			ctx.Data(http.StatusInternalServerError, "", []byte{})
			return
		}
		bytes, err := ctrler.services.PenaltyExport.ExportCSV(data)
		if err != nil {
			ctrler.services.Logger.Error(err.Error(), slimlog.Error("ExportCSVErr"))
			ctx.Data(http.StatusInternalServerError, "", []byte{})
			return
		}
		ctx.Data(http.StatusOK, "text/csv", bytes.Bytes())
		return
	}
	if fileType == ".xlsx"{
		data, err := ctrler.services.Repos.PenaltyRepository.GetPenaltyExcelData(repoFilter)
		if err != nil{
			ctrler.services.Logger.Error(err.Error(), slimlog.Error("GetExcelData"))
			ctx.Data(http.StatusInternalServerError, "", []byte{})
			return
		}
		bytes, err := ctrler.services.PenaltyExport.ExportExcel(data)
		if err != nil {
			ctrler.services.Logger.Error(err.Error(), slimlog.Error("ExportExcelErr"))
			ctx.Data(http.StatusInternalServerError, "", []byte{})
			return
		}
		ctx.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", bytes.Bytes())
	}
	ctx.Data(http.StatusBadRequest, "", []byte{})
}
func NewPenaltyController(services * services.Services) PenaltyController {
	return &Penalty{
			services: services,
	}
}
type PenaltyController interface {
	GetPenalties (ctx * gin.Context)
	UpdatePenaltySettlement(ctx *gin.Context)
	AddPenalty( ctx * gin.Context)
	UpdatePenalty( ctx * gin.Context)
	NewClassfication(ctx * gin.Context) 
	GetPenaltyClasses(ctx * gin.Context)
	UpdatePenaltyClass(ctx * gin.Context)
	DeletePenaltyClass(ctx * gin.Context)
	GetBill(ctx * gin.Context)
	ExportPenalties(ctx * gin.Context)
}