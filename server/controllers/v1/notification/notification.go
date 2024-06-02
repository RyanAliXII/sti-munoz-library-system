package notification

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)


type Notification struct {
	services * services.Services
}
type NotificationController interface {
	GetNotifications(ctx * gin.Context)
	MarkAsRead(ctx * gin.Context)
	
}
func NewNotificationController(services * services.Services) NotificationController {
	return &Notification{
		services: services,
	}
}
func (ctrler *Notification) GetNotifications(ctx * gin.Context){
	accountId := ctx.GetString("requestorId")
	app := ctx.GetString("requestorApp")
	if app == azuread.AdminAppClientId{
		notifications, err := ctrler.services.Repos.NotificationRepository.GetAdminNotificationByAccountId(accountId)
		if err != nil {
			logger.Error(err.Error())
		}
		ctx.JSON(httpresp.Success200(gin.H{
			"notifications": notifications,
		}, "Notifications fetched."))
		return
	}
	if app == azuread.ClientAppClientId{
		notifications, err :=ctrler.services.Repos.NotificationRepository.GetClientNotificationByAccountId(accountId)
		if err != nil {
			logger.Error(err.Error())
		}
		ctx.JSON(httpresp.Success200(gin.H{
			"notifications": notifications,
		}, "Notifications fetched."))
		return
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"notifications": []string{},
	}, "Notifications fetched."))	
} 
func (ctrler * Notification)MarkAsRead(ctx * gin.Context) {
	accountId := ctx.GetString("requestorId")
	app := ctx.GetString("requestorApp")
	if app == azuread.AdminAppClientId{
		err := ctrler.services.Repos.NotificationRepository.MarkAdminNotificationsAsRead(accountId)
		if err != nil {
			logger.Error(err.Error())
		}
		ctx.JSON(httpresp.Success200(gin.H{}, "Notifications read."))
		return
	}
	if app == azuread.ClientAppClientId{
	 err := ctrler.services.Repos.NotificationRepository.MarkClientNotificationsAsRead(accountId)
		if err != nil {
			logger.Error(err.Error())
		}
		ctx.JSON(httpresp.Success200(nil, "Notifications read."))
		return
	}
	ctx.JSON(httpresp.Success200(nil, "Notifications read."))	
}