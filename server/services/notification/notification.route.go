package notification

import "github.com/gin-gonic/gin"



func NotificationRoutes (r * gin.RouterGroup){
	ctrler := NewNotificationController()
	r.GET("", ctrler.GetNotifications)
	r.PATCH("read", ctrler.MarkAsRead)
}