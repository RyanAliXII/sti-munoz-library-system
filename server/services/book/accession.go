package book

import (
	"database/sql"
	"strconv"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/google/uuid"
)

func (ctrler *BookController) GetAccession(ctx *gin.Context) {
	
	filter := filter.ExtractFilter(ctx)

	if len(filter.Keyword) > 0 {
		accessions := ctrler.accessionRepo.SearchAccession(filter)
		metadata, err := ctrler.recordMetadataRepo.GetAccessionSearchMetadata(filter)
		if err != nil {
			logger.Error(err.Error(), slimlog.Error("GetAccessionMetadataErr"))
			ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
			return
		} 
		ctx.JSON(httpresp.Success200(gin.H{
			"accessions": accessions,
			"metadata": metadata,
		}, "Accession Fetched."))
		return
	}
	
	accessions := ctrler.accessionRepo.GetAccessions(filter)
	metadata, err := ctrler.recordMetadataRepo.GetAccessionMetadata(filter.Limit)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("GetAccessionMetadataErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	} 
	ctx.JSON(httpresp.Success200(gin.H{
		"accessions": accessions,
		"metadata": metadata,
	}, "Accession Fetched."))
}


func (ctrler *BookController) GetAccessionByBookId(ctx *gin.Context) {
	id := ctx.Param("id")
	_, parseErr := uuid.Parse(id)
	if parseErr != nil {
		ctx.JSON(httpresp.Fail404(nil, "Invalid id param."))
		return
	}
	appId := ctx.GetString("requestorApp")
	var	accessions []model.Accession; 
	ignoreWeeded := ctx.Query("ignoreWeeded")
    if ignoreWeeded == "false" && appId == azuread.AdminAppClientId{
          accessions = ctrler.accessionRepo.GetAccessionsByBookIdDontIgnoreWeeded(id)
	}else{
		accessions = ctrler.accessionRepo.GetAccessionsByBookId(id)
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"accessions": accessions,
	}, "Accessions successfully fetched for specific book."))
}
func (ctrler * BookController)GetAccessionById (ctx * gin.Context){
	id := ctx.Param("id")
	accession, err := ctrler.accessionRepo.GetAccessionsById(id)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error(err.Error()))
		if err == sql.ErrNoRows {
			ctx.JSON(httpresp.Fail404(nil, "Not found"))
			return
		}
		ctx.JSON(httpresp.Fail400(nil, "unknown erorr occured"))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{"accession": accession}, "OK"))
}
 func (ctrler *  BookController) UpdateAccessionStatus(ctx * gin.Context) {
	id := ctx.Param("id")
	status, err := strconv.Atoi(ctx.Query("action"))
	const (
		weed = 1
		recirculate = 2
		missing = 3
	)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("convErr"))
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
 func(ctrler * BookController) handleWeeding (id string, ctx * gin.Context ){
    body := WeedingBody{}
	ctx.ShouldBindBodyWith(&body, binding.JSON)
    err := ctrler.accessionRepo.WeedAccession(id, body.Remarks)
    if err != nil {
	 logger.Error(err.Error(), slimlog.Error("weedingErr"))
	 ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
	 return
   }
	ctx.JSON(httpresp.Success200(nil, "Book weeded successfully."))
 }
 func(ctrler * BookController) handleMarkAsMissing (id string, ctx * gin.Context ){
    body := WeedingBody{}
	ctx.ShouldBindBodyWith(&body, binding.JSON)
    err := ctrler.accessionRepo.MarkAsMissing(id, body.Remarks)
    if err != nil {
	 logger.Error(err.Error(), slimlog.Error("weedingErr"))
	 ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
	 return
   }
	ctx.JSON(httpresp.Success200(nil, "Book weeded successfully."))
 }
 func(ctrler * BookController) handleRecirculation ( id string,  ctx * gin.Context ){
	 
	 err := ctrler.accessionRepo.Recirculate(id)
	if err != nil {
	  logger.Error(err.Error(), slimlog.Error("recirculateErr"))
	  ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
	  return
	}
	 ctx.JSON(httpresp.Success200(nil, "Book re-circulated successfully."))
}


func(ctrler * BookController)AddBookCopies(ctx * gin.Context){
	id := ctx.Param("id")
	body := AddBookCopyBody{}
	err := ctx.ShouldBindBodyWith(&body, binding.JSON)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("convErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return 
	}
	err = ctrler.bookRepository.AddBookCopies(id, body.Copies)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("addBookCopiesErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return 
	}
	ctx.JSON(httpresp.Success200(nil, "New copies added."))
}

func (ctrler * BookController)UpdateAccession(ctx * gin.Context){
	id := ctx.Param("id")
	accession := model.Accession{}
	err := ctx.Bind(&accession)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
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
	err = ctrler.accessionRepo.UpdateAccession(accession)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("UpdateAccessionError"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Accession updated."))
}
func (ctrler * BookController)GetAccessionsByCollection(ctx * gin.Context) {
	collectionId, err  := strconv.Atoi(ctx.Param("collectionId"))
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("bindErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	accessions, err :=ctrler.accessionRepo.GetAccessionByCollection(collectionId)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("getAccessionsErrorByCollection"))
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"accessions": accessions,
	}, "Accessions fetched by collection id."))

}
