package notification

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/gin-gonic/gin"
)


type Notification struct {
	
}
type NotificationController interface {
	GetNotifications(ctx * gin.Context)
	MarkAsRead(ctx * gin.Context)
	
}
func NewNotificationController() NotificationController {
	return &Notification{}
}
func (ctrler *Notification) GetNotifications(ctx * gin.Context){
	// accountId := ctx.GetString("requestorId")
	// app := ctx.GetString("requestorApp")
	// if app == azuread.AdminAppClientId{
	// 	notifications, err := ctrler.notificationRepo.GetAdminNotificationByAccountId(accountId)
	// 	if err != nil {
	// 		logger.Error(err.Error())
	// 	}
	// 	ctx.JSON(httpresp.Success200(gin.H{
	// 		"notifications": notifications,
	// 	}, "Notifications fetched."))
	// 	return
	// }
	// if app == azuread.ClientAppClientId{
	// 	notifications, err := ctrler.notificationRepo.GetClientNotificationByAccountId(accountId)
	// 	if err != nil {
	// 		logger.Error(err.Error())
	// 	}
	// 	ctx.JSON(httpresp.Success200(gin.H{
	// 		"notifications": notifications,
	// 	}, "Notifications fetched."))
	// 	return
	// }
	ctx.JSON(httpresp.Success200(gin.H{
		"notifications": []string{},
	}, "Notifications fetched."))	
} 
func (ctrler * Notification)MarkAsRead(ctx * gin.Context) {
	// accountId := ctx.GetString("requestorId")
	// app := ctx.GetString("requestorApp")
	// if app == azuread.AdminAppClientId{
	// 	err := ctrler.notificationRepo.MarkAdminNotificationsAsRead(accountId)
	// 	if err != nil {
	// 		logger.Error(err.Error())
	// 	}
	// 	ctx.JSON(httpresp.Success200(gin.H{}, "Notifications read."))
	// 	return
	// }
	// if app == azuread.ClientAppClientId{
	//  err := ctrler.notificationRepo.MarkClientNotificationsAsRead(accountId)
	// 	if err != nil {
	// 		logger.Error(err.Error())
	// 	}
	// 	ctx.JSON(httpresp.Success200(nil, "Notifications read."))
	// 	return
	// }
	ctx.JSON(httpresp.Success200(nil, "Notifications read."))	
}