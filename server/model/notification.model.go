package model

type AdminNotification struct {
	Id string `json:"id" db:"id"`
	NotificationId string `json:"notificationId" db:"notification_id"`
	Message string `json:"message" db:"message"`
	AccountId string `json:"accountId" db:"account_id"`
	Link string `json:"link" db:"link"`
	IsRead bool `json:"isRead" db:"is_read"`
}