package book

import (
	"database/sql"
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/google/uuid"
)

func (ctrler *Book) GetAccession(ctx *gin.Context) {
	
	filter := filter.ExtractFilter(ctx)

	if len(filter.Keyword) > 0 {
		accessions := ctrler.services.Repos.AccessionRepository.SearchAccession(filter)
		metadata, err := ctrler.services.Repos.RecordMetadataRepository.GetAccessionSearchMetadata(filter)
		if err != nil {
			ctrler.services.Logger.Error(err.Error(), applog.Error("GetAccessionMetadataErr"))
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
			return
		} 
		ctx.JSON(httpresp.Success200(gin.H{
			"accessions": accessions,
			"metadata": metadata,
		}, "Accession Fetched."))
		return
	}
	
	accessions := ctrler.services.Repos.AccessionRepository.GetAccessions(filter)
	metadata, err := ctrler.services.Repos.RecordMetadataRepository.GetAccessionMetadata(filter.Limit)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("GetAccessionMetadataErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	} 
	ctx.JSON(httpresp.Success200(gin.H{
		"accessions": accessions,
		"metadata": metadata,
	}, "Accession Fetched."))
}


func (ctrler *Book) GetAccessionByBookId(ctx *gin.Context) {
	id := ctx.Param("id")
	_, parseErr := uuid.Parse(id)
	if parseErr != nil {
		ctx.JSON(httpresp.Fail404(nil, "Invalid id param."))
		return
	}
	appId := ctx.GetString("requestorApp")
	var	accessions []model.Accession; 
	ignoreWeeded := ctx.Query("ignoreWeeded")
    if ignoreWeeded == "false" && appId == ctrler.services.Config.AdminAppClientID{
          accessions = ctrler.services.Repos.AccessionRepository.GetAccessionsByBookIdDontIgnoreWeeded(id)
	}else{
		accessions =ctrler.services.Repos.AccessionRepository.GetAccessionsByBookId(id)
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"accessions": accessions,
	}, "Accessions successfully fetched for specific book."))
}
func (ctrler *Book)GetAccessionById (ctx * gin.Context){
	id := ctx.Param("id")
	accession, err := ctrler.services.Repos.AccessionRepository.GetAccessionsById(id)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error(err.Error()))
		if err == sql.ErrNoRows {
			ctx.JSON(httpresp.Fail404(nil, "Not found"))
			return
		}
		ctx.JSON(httpresp.Fail400(nil, "unknown erorr occured"))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{"accession": accession}, "OK"))
}
 func (ctrler *Book) UpdateAccessionStatus(ctx * gin.Context) {
	id := ctx.Param("id")
	status, err := strconv.Atoi(ctx.Query("action"))
	const (
		weed = 1
		recirculate = 2
		missing = 3
	)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("convErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
	}
	switch(status){
		case weed: 
			ctrler.handleWeeding(id, ctx);
			return
	case missing:
			ctrler.handleMarkAsMissing(id, ctx)
		case recirculate: 
			ctrler.handleRecirculation(id, ctx)
			return 
	}
   ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))

 }
 func(ctrler  *Book) handleWeeding (id string, ctx * gin.Context ){
    body := WeedingBody{}
	ctx.ShouldBindBodyWith(&body, binding.JSON)
    err := ctrler.services.Repos.AccessionRepository.WeedAccession(id, body.Remarks)
    if err != nil {
	 ctrler.services.Logger.Error(err.Error(), applog.Error("weedingErr"))
	 ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
	 return
   }
	ctx.JSON(httpresp.Success200(nil, "Book weeded successfully."))
 }
 func(ctrler *Book) handleMarkAsMissing (id string, ctx * gin.Context ){
    body := WeedingBody{}
	ctx.ShouldBindBodyWith(&body, binding.JSON)
    err := ctrler.services.Repos.AccessionRepository.MarkAsMissing(id, body.Remarks)
    if err != nil {
	 ctrler.services.Logger.Error(err.Error(), applog.Error("weedingErr"))
	 ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
	 return
   }
	ctx.JSON(httpresp.Success200(nil, "Book weeded successfully."))
 }
 func(ctrler *Book) handleRecirculation ( id string,  ctx * gin.Context ){ 
	err := ctrler.services.Repos.AccessionRepository.Recirculate(id)
	if err != nil {
	  ctrler.services.Logger.Error(err.Error(), applog.Error("recirculateErr"))
	  ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
	  return
	}
	 ctx.JSON(httpresp.Success200(nil, "Book re-circulated successfully."))
}


func(ctrler *Book)AddBookCopies(ctx * gin.Context){
	id := ctx.Param("id")
	body := AddBookCopyBody{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("convErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	}
err = ctrler.services.Repos.BookRepository.AddBookCopy(id, body.AccessionNumber)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("addBookCopiesErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "New copies added."))
}

func (ctrler *Book)UpdateAccession(ctx * gin.Context){
	id := ctx.Param("id")
	accession := model.Accession{}
	err := ctx.Bind(&accession)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	accession.Id = id
	fieldErrs, err := accession.ValidateUpdate()
	if err != nil {
		ctx.JSON(httpresp.Fail400(gin.H{
			"errors": fieldErrs,
		}, "Validation error."))
		return 
	}
	err = ctrler.services.Repos.AccessionRepository.UpdateAccession(accession)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("UpdateAccessionError"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Accession updated."))
}
func (ctrler  *Book)GetAccessionsByCollection(ctx * gin.Context) {
	collectionId, err  := strconv.Atoi(ctx.Param("collectionId"))
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	accessions, err := ctrler.services.Repos.AccessionRepository.GetAccessionByCollection(collectionId)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("getAccessionsErrorByCollection"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"accessions": accessions,
	}, "Accessions fetched by collection id."))

}

func (ctrler  *Book)UpdateAccessionBulk(ctx * gin.Context) {
	collectionId, err := strconv.Atoi(ctx.Param("collectionId"))
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("convErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	} 
	body := BulkAccessionUpdateBody{}
	err = ctx.ShouldBindJSON(&body)
	if err != nil{
		ctrler.services.Logger.Error(err.Error(), applog.Error("BindingErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	}
	errors, ok := body.ValidateDuplicateAccessionNumber()
	if !ok {
		ctx.JSON(httpresp.Fail400(gin.H{
			"errors": errors,
		}, "Validation error."))
		return
	}
	err = ctrler.services.Repos.AccessionRepository.UpdateBulkByCollectionId(body.Accessions, collectionId)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("UpdateBulkError"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Accession updated."))
}
func(ctrler * Book)DeleteAccession(ctx * gin.Context) {
	id := ctx.Param("id")
	err := ctrler.services.Repos.AccessionRepository.Delete(id)
	if err != nil {
		ctrler.services.Logger.Error(err.Error(), applog.Error("DeleteAccessionError"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "Accession Deleted."))
}

