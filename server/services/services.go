package services

type Services struct {
	Notification  NotificationService;
}
func BuildServices () Services {
	return Services{
		Notification: NewNotificationService(),
	}
}
