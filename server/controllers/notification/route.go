package notification

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"
	"github.com/gin-gonic/gin"
)



func NotificationRoutes (r * gin.RouterGroup, services * services.Services){
	ctrler := NewNotificationController(services)
	r.GET("", ctrler.GetNotifications)
	r.PATCH("read", ctrler.MarkAsRead)
}