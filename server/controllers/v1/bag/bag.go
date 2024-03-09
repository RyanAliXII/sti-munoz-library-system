package bag

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)



type BagController interface {
	AddBagItem (ctx * gin.Context)
	GetBagItems (ctx * gin.Context)
	DeleteItemFromBag (ctx * gin.Context)
	CheckItemFromBag(ctx * gin.Context)
	CheckOrUncheckAllItems(ctx * gin.Context)
	DeleteAllCheckedItems(ctx * gin.Context)
	CheckoutCheckedItems(ctx *gin.Context)
	
}
type Bag struct {
	bagRepo repository.BagRepository
	notificationRepo repository.NotificationRepository
	accountRepo repository.AccountRepositoryInterface
}

func (ctrler * Bag) AddBagItem (ctx * gin.Context){
  
	accountId, hasAccountId := ctx.Get("requestorId")
	parsedAccountId, isStr  := accountId.(string)
	if(!hasAccountId  || !isStr){
	 ctx.JSON(httpresp.Fail400(nil, "invalid account id."))
     return
	}
	item := model.BagItem{}
	ctx.ShouldBindBodyWith(&item, binding.JSON)

	if len(item.AccessionId) == 0 && len(item.BookId) == 0{
		ctx.JSON(httpresp.Fail500(nil, "Validation error."))
		return
	}
	item.AccountId = parsedAccountId
     addItemErr := ctrler.bagRepo.AddItemToBag(item)
	 if(addItemErr != nil){
		logger.Error(addItemErr.Error(), slimlog.Error("addItemErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured. Please try again later."))
		return
	 }
	ctx.JSON(httpresp.Success200(nil, "Bag item has been added."))
}
func(ctrler  * Bag) GetBagItems (ctx * gin.Context){
	accountId, hasAccountId := ctx.Get("requestorId")
	parsedAccountId, isStr  := accountId.(string)
	if(!hasAccountId  || !isStr){
	 ctx.JSON(httpresp.Fail400(nil, "invalid account id."))
	 return
	}
	items := ctrler.bagRepo.GetItemsFromBagByAccountId(parsedAccountId)
	ctx.JSON(httpresp.Success200(gin.H{
			"bag": items}, "Bag items has been fetched."))
}
func (ctrler * Bag) DeleteItemFromBag (ctx * gin.Context){
	accountId, hasAccountId := ctx.Get("requestorId")
	parsedAccountId, isStr  := accountId.(string)
	id := ctx.Param("id")
	if(!hasAccountId  || !isStr){
	 ctx.JSON(httpresp.Fail400(nil, "invalid account id."))
	 return
	}
	deleteErr := ctrler.bagRepo.DeleteItemFromBag(model.BagItem{
		Id: id,
		AccountId: parsedAccountId,
	})

	if deleteErr != nil{
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured. Please try again later."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Bag item has been deleted."))
}

func (ctrler * Bag)CheckItemFromBag(ctx * gin.Context){
	accountId, hasAccountId := ctx.Get("requestorId")
	parsedAccountId, isStr  := accountId.(string)
	id := ctx.Param("id")
	if(!hasAccountId  || !isStr){
	 ctx.JSON(httpresp.Fail400(nil, "invalid account id."))
	 return
	}
	checkErr := ctrler.bagRepo.CheckItemFromBag(model.BagItem{
		Id: id,
		AccountId: parsedAccountId,
	})

	if checkErr != nil {
		logger.Error(checkErr.Error(), slimlog.Error("CheckItemFromBagErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured. Please try again later."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Bag item has been added to checklist."))
}
func (ctrler * Bag)CheckOrUncheckAllItems(ctx * gin.Context){
	accountId, hasAccountId := ctx.Get("requestorId")
	action := ctx.Query("action")

	if action != "check" && action != "uncheck" {
		ctx.JSON(httpresp.Fail400(nil, "invalid action."))
		return 
	}
	parsedAccountId, isStr  := accountId.(string)

	if(!hasAccountId  || !isStr){
	 ctx.JSON(httpresp.Fail400(nil, "invalid account id."))
	 return
	}
	var checkErr error = nil
	if(action == "check"){
		checkErr = ctrler.bagRepo.CheckAllItemsFromBag(parsedAccountId)
	}
	if(action == "uncheck"){
		checkErr = ctrler.bagRepo.UncheckAllItemsFromBag(parsedAccountId)
	}
	if checkErr != nil {
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured. Please try again later."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Bag checklist has been updated."))
}
func (ctrler * Bag) DeleteAllCheckedItems (ctx * gin.Context){
	accountId, hasAccountId := ctx.Get("requestorId")
	parsedAccountId, isStr  := accountId.(string)

	if(!hasAccountId  || !isStr){
	 ctx.JSON(httpresp.Fail400(nil, "invalid account id."))
	 return
	}
	deleteErr := ctrler.bagRepo.DeleteAllCheckedItems(parsedAccountId)
	if deleteErr != nil{
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured. Please try again later."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Bag checked item has been deleted."))
}
func (ctrler * Bag) CheckoutCheckedItems(ctx *gin.Context){
	accountId, hasAccountId := ctx.Get("requestorId")
	parsedAccountId, isStr  := accountId.(string)

	if(!hasAccountId  || !isStr){
	 ctx.JSON(httpresp.Fail400(nil, "invalid account id."))
	 return
	}
	groupId,checkoutErr := ctrler.bagRepo.CheckoutCheckedItems(parsedAccountId)
	if checkoutErr != nil{
		logger.Error(checkoutErr.Error(), slimlog.Error("checkoutErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured. Please try again later."))
		return
	}
	account ,err := ctrler.accountRepo.GetAccountByIdDontIgnoreIfDeletedOrInactive(parsedAccountId)
	if err != nil {
		logger.Error(err.Error())
	}
	

	err = ctrler.notificationRepo.NotifyAdminsWithPermission(model.AdminNotification{
		Message: fmt.Sprintf("%s %s has requested to borrow a book.", account.GivenName, account.Surname),
		Link: fmt.Sprintf("/borrowing/requests/%s", groupId),
	}, "BorrowedBook.Read")
	if err != nil {
		logger.Error(err.Error())
	}
	ctx.JSON(httpresp.Success200(nil, "Books has been checked out."))
} 


func NewBagController()BagController {
	return &Bag{
		bagRepo: repository.NewBagRepository(),
		notificationRepo: repository.NewNotificationRepository(),
		accountRepo: repository.NewAccountRepository(),
	}
}