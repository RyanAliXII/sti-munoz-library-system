package notification

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
)


type Notification struct {
	notificationRepo repository.NotificationRepository
}
type NotificationController interface {
	GetNotifications(ctx * gin.Context)
}
func NewNotificationController() NotificationController {
	return &Notification{
		notificationRepo: repository.NewNotificationRepository(),
	}
}

func (ctrler *Notification) GetNotifications(ctx * gin.Context){
	accountId := ctx.GetString("requestorId")
	notifications, err := ctrler.notificationRepo.GetAdminNotificationByAccountId(accountId)
	if err != nil {
		logger.Error(err.Error())
	}
	ctx.JSON(httpresp.Success200(gin.H{
		"notifications": notifications,
	}, "Notifications fetched."))
	
} 