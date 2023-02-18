package repository

import (
	"fmt"
	"slim-app/server/app/pkg/rabbitmq"
	"slim-app/server/app/pkg/slimlog"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.uber.org/zap"
)

type NotificationRepository struct {
	rabbit  *rabbitmq.RabbitMQ
	Message chan amqp.Delivery
}

func (repo *NotificationRepository) ListenByAccountId(accountId string) error {

	exchangeErr := repo.rabbit.Channel.ExchangeDeclare(
		"notification",      // name
		amqp.ExchangeDirect, // type
		true,                // durable
		false,               // auto-deleted
		false,               // internal
		false,               // no-wait
		nil,                 // arguments
	)
	if exchangeErr != nil {
		logger.Error(exchangeErr.Error(), slimlog.Function("NotificationRepository.Listen"), slimlog.Error("exchangeErr"))
		return exchangeErr
	}
	queue, queueErr := repo.rabbit.Channel.QueueDeclare(
		"",    // queue name
		false, // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,
	)

	if queueErr != nil {
		logger.Error(queueErr.Error(), slimlog.Function("NotificationRepository.Listen"), slimlog.Error("queueErr"))
		return queueErr
	}
	routingKey := fmt.Sprintf("notify_account_%s", accountId)
	bindErr := repo.rabbit.Channel.QueueBind(
		queue.Name,     // queue name
		routingKey,     // routing key
		"notification", // exchange
		false,
		nil,
	)
	if bindErr != nil {
		logger.Error(bindErr.Error(), slimlog.Function("NotificationRepository.Listen"), slimlog.Error("bindErr"))
		return bindErr
	}

	messages, consumeErr := repo.rabbit.Channel.Consume(
		queue.Name, // queue name
		"",         // consumer
		true,       // auto-ack
		false,      // exclusive
		false,      // no local
		false,      // no wait
		nil,        // arguments
	)
	if consumeErr != nil {
		logger.Error(consumeErr.Error(), slimlog.Function("NotificationRepository.Listen"), slimlog.Error("consumeErr"))
		return consumeErr
	}
	for d := range messages {
		logger.Info("New notification", zap.String("account", accountId))
		repo.Message <- d
	}

	return nil

}
func NewNotificationRepository(rabbit *rabbitmq.RabbitMQ) NotificationRepository {
	return NotificationRepository{
		rabbit:  rabbit,
		Message: make(chan amqp.Delivery),
	}
}

type NotificationRepositoryInterface interface {
	Listen() error
}
