package broadcasting

type Broadcasters struct {
	NotificationBroadcaster NotificationBroadcasterInterface
}

func NewBroadcasters() Broadcasters {

	return Broadcasters{
		NotificationBroadcaster: NewNotificationBroadcaster(),
	}
}
