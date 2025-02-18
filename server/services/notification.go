package services

import (
	"context"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/rabbitmq"
	amqp "github.com/rabbitmq/amqp091-go"
	"go.uber.org/zap"
)

type Notification struct {
	rabbit  *rabbitmq.RabbitMQ
	logger *zap.Logger
}
type NotificationHub struct {
	rabbit  *rabbitmq.RabbitMQ
	logger *zap.Logger
	message chan amqp.Delivery
	stop    chan bool
}

func(n * Notification) NewHub()*NotificationHub{
	return &NotificationHub{
			rabbit: n.rabbit,
			message: make(chan amqp.Delivery),
			stop: make(chan bool),
			logger: n.logger,
	}
}
func (hub * NotificationHub) ListenByRoutingKey(routingKey string, context context.Context) error {
	
	err := hub.rabbit.Channel.ExchangeDeclare(
		"notification",      // name
		amqp.ExchangeDirect, // type
		true,                // durable
		false,               // auto-deleted
		false,               // internal
		false,               // no-wait
		nil,                 // arguments
	)
	if err != nil {
		return err
	}

	queue, err := hub.rabbit.Channel.QueueDeclare(
		"",    // queue name"
		false, // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,
	)

	if err != nil {
		return err

	}
	err = hub.rabbit.Channel.QueueBind(
		queue.Name,     // queue name
		routingKey,     // routing key
		"notification", // exchange
		false,
		nil,
	)
	if err != nil {
		return err
	}

	messages, consumeErr := hub.rabbit.Channel.Consume(
		queue.Name, // queue name
		"",         // consumer
		true,       // auto-ack
		false,      // exclusive
		false,      // no local
		false,      // no wait
		nil,        // arguments
	)

	if consumeErr != nil {
		return consumeErr
	}
	/*
		First case checks if context.Cancel is called then exit;
		Second case check if there is a message and broadcast to message channel
	*/
	for {
		
		select {
		case <-context.Done():
			err := hub.deleteQueue(queue.Name)
			if err != nil {
				hub.logger.Error(err.Error())
				return err
			}
			return nil
		case d, ok := <-messages:
			if !ok {
				hub.stop <- true
				err := hub.deleteQueue(queue.Name)
				if err != nil {
					hub.logger.Error(err.Error())
					return err
				}
				return nil
			}
			hub.message <- d
		}

	}

}
func (hub *NotificationHub) Message() <-chan amqp.Delivery {
	return hub.message

}
func (hub *NotificationHub) Stop() <-chan bool {
	return hub.stop
}
func(hub *NotificationHub)deleteQueue(queueName string) error{
	_, err := hub.rabbit.Channel.QueueDelete(queueName, false, false, false)
	if err != nil {
		return err
	}
	return nil
}
func NewNotificationService(rabbitMQ * rabbitmq.RabbitMQ, logger *zap.Logger) NotificationService{
	rabbit := rabbitMQ
	return &Notification{
		rabbit:  rabbit,
		logger: logger,
	}
}
type NotificationService interface {
	NewHub()*NotificationHub
}
