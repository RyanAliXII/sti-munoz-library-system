package rabbitmq

import (
	"fmt"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/configmanager"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.uber.org/zap"
)


type RabbitMQ struct {
	Connection *amqp.Connection
	Channel    *amqp.Channel
}
var logger = slimlog.GetInstance()
func createConnection(config * configmanager.Config) *RabbitMQ {
	var connection *amqp.Connection
	var channel *amqp.Channel
	var lastError error
	const retries = 10
	var connectionString = fmt.Sprintf("amqp://%s:%s@%s:%s", config.RabbitMQ.User, config.RabbitMQ.Password, config.RabbitMQ.Host, config.RabbitMQ.Port)
	for i := 0; i < retries; i++ {
		logger.Info("Connecting to RabbitMQ")
		tempConnection, connectionErr := amqp.Dial(connectionString)
		if connectionErr != nil {
			logger.Warn(connectionErr.Error(), zap.String("nextAction", "Will attempt to redial RabbitMQ."))
			lastError = connectionErr
			time.Sleep(time.Second * 2)
			continue
		}
		tempChannel, channelErr := tempConnection.Channel()
		if channelErr != nil {
			logger.Warn(channelErr.Error(), zap.String("nextAction", "Will attempt to redial RabbitMQ."))
			lastError = channelErr
			time.Sleep(time.Second * 2)
			continue
		}
		lastError = nil
		connection = tempConnection
		channel = tempChannel
		break
	}

	if lastError != nil {
		logger.Error(lastError.Error(), slimlog.Error("Failed to dial RabbitMQ."))
		panic(lastError.Error())
	}
	logger.Info("Successfully connected to RabbitMQ.")
	return &RabbitMQ{
		Connection: connection,
		Channel:    channel,
	}
}
func New(config * configmanager.Config) *RabbitMQ {
	var rabbitMQ = createConnection(config)
	return rabbitMQ
}
