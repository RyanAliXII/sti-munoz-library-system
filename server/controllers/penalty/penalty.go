package penalty

import (
	"bytes"
	"database/sql"
	"fmt"
	"net/http"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/browser"
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
	if requestorApp == ctrler.services.Config.AdminAppClientID {
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
			ctrler.services.Logger.Error(err.Error(), applog.Error("GetPenaltiesErr"))
		}
		ctx.JSON(httpresp.Success200(gin.H{
				"penalties": penalties,
				"metadata": metadata,
		}, "penalties has been fetched."))
		return
	}
	if requestorApp == ctrler.services.Config.ClientAppClientID{
		requestorId := ctx.GetString("requestorId")
		penalties, err := ctrler.services.Repos.PenaltyRepository.GetPenaltiesByAccountId(requestorId)
		if err != nil {
			ctrler.services.Logger.Error(err.Error(), applog.Error("GetPenaltiesByAccountId"))
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
			ctrler.services.Logger.Error(err.Error(), applog.Error("UpdateSettlement"))
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
			return 
		}
		ctx.JSON(httpresp.Success200(nil, "Settlement has been updated."))
		return
	}
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("BindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	}
	err = ctrler.services.Repos.PenaltyRepository.MarkAsSettled(penaltyId, body.Proof, body.Remarks)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("	MarkAsSettled"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Settlement has been updated."))

}
func (ctrler * Penalty)AddPenalty(ctx * gin.Context){
    penalty := model.Penalty{}
	ctx.ShouldBindBodyWith(&penalty, binding.JSON)
	id, addErr := ctrler.services.Repos.PenaltyRepository.AddPenalty(penalty)
	if addErr!= nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured please try again later."))
		return
	}
	dbPenalty, err := ctrler.services.Repos.PenaltyRepository.GetPenaltyById(id)
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
		ctx.JSON(httpresp.Success200(nil, "Penalty has been added."))
		return 
	}
	routingKey := fmt.Sprintf("notify_client_%s", penalty.AccountId)
	message := fmt.Sprintf("You have received a penalty amounting %.2f. Reason: %s",dbPenalty.Amount, dbPenalty.Description)
	err = ctrler.services.Repos.NotificationRepository.NotifyClient(model.ClientNotification{
		Message: message,
		AccountId: penalty.AccountId,
		Link: "/penalties",
	})
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
	}
	err = ctrler.services.Broadcaster.Broadcast("notification", routingKey, []byte(message))
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
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
	requestorApp := ctx.GetString("requestorApp")
	/* 
		Check if request comes from client application and validate by 
		checking if user is trying to fetch his/her own bill
	*/
	if requestorApp == ctrler.services.Config.ClientAppClientID{
		accountId := ctx.GetString("requestorId")
		_, err := ctrler.services.Repos.PenaltyRepository.GetPenaltyByIdAndAccountId(id, accountId)
		if err != nil {
			ctrler.services.Logger.Error(err.Error(), applog.Error("GetPenaltyByIdAndAccountIdErr"))
			if err == sql.ErrNoRows {
				ctx.Data(http.StatusNotFound, "application/pdf", []byte{})
				return
			}
			ctx.Data(http.StatusInternalServerError, "application/pdf", []byte{})
			return
		}
	}
	browser, err := browser.NewBrowser()
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("NewBrowserErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	url := fmt.Sprintf("http://localhost:5200/billing/penalty/%s",  id)
	page := browser.GetPageFromPool()
	defer browser.ReturnPageToPool(page)
	err = page.Navigate(url)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("NavigateErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	err = page.WaitLoad()
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("waitLoadErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	pdf, err := page.PDF( &proto.PagePrintToPDF{
		PaperWidth:  gson.Num(8.5),
		PaperHeight: gson.Num(11),
		
	})
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("PDFError"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	var buffer bytes.Buffer
	_, err = buffer.ReadFrom(pdf)
	if err != nil {
		ctrler.services.Logger.Error(err.Error())
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
			ctrler.services.Logger.Error(err.Error(), applog.Error("GetPenaltyCSVData"))
			ctx.Data(http.StatusInternalServerError, "", []byte{})
			return
		}
		bytes, err := ctrler.services.PenaltyExport.ExportCSV(data)
		if err != nil {
			ctrler.services.Logger.Error(err.Error(), applog.Error("ExportCSVErr"))
			ctx.Data(http.StatusInternalServerError, "", []byte{})
			return
		}
		ctx.Data(http.StatusOK, "text/csv", bytes.Bytes())
		return
	}
	if fileType == ".xlsx"{
		data, err := ctrler.services.Repos.PenaltyRepository.GetPenaltyExcelData(repoFilter)
		if err != nil{
			ctrler.services.Logger.Error(err.Error(), applog.Error("GetExcelData"))
			ctx.Data(http.StatusInternalServerError, "", []byte{})
			return
		}
		bytes, err := ctrler.services.PenaltyExport.ExportExcel(data)
		if err != nil {
			ctrler.services.Logger.Error(err.Error(), applog.Error("ExportExcelErr"))
			ctx.Data(http.StatusInternalServerError, "", []byte{})
			return
		}
		ctx.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", bytes.Bytes())
	}
	ctx.Data(http.StatusBadRequest, "", []byte{})
}
func (ctrler * Penalty)GetProofOfPaymentUrl(ctx * gin.Context){
	id := ctx.Param("id")
	penalty, err :=  ctrler.services.Repos.PenaltyRepository.GetPenaltyById(id)
	if err != nil {
		if err == sql.ErrNoRows {
			ctrler.services.Logger.Warn("Penalty not found while trying to get proof of payment ", applog.Error("GetProofOfPayment"))
			ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
			return 
		}
		ctrler.services.Logger.Error(err.Error(), applog.Error("GetPenaltyById"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	if(len(penalty.Proof) == 0){
		ctrler.services.Logger.Warn("No payment proof is attached.", applog.Error("GetProofOfPayment"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	}
	bucket := ctrler.services.Config.AWS.DefaultBucket
	url, err := ctrler.services.FileStorage.GenerateGetRequestUrl(penalty.Proof, bucket)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("GenerateRequestUrl"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"url" : url,
	}, "Url fetched."))

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
	GetProofOfPaymentUrl(ctx * gin.Context)
}