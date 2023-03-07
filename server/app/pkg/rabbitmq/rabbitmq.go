package rabbitmq

import (
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.uber.org/zap"
)

var USER = os.Getenv("RABBITMQ_DEFAULT_USER")
var PASSWORD = os.Getenv("RABBITMQ_DEFAULT_PASS")
var HOST = os.Getenv("RABBITMQ_HOST")
var PORT = os.Getenv("RABBITMQ_PORT")

var CONNECTION_STRING = fmt.Sprintf("amqp://%s:%s@%s:%s", USER, PASSWORD, HOST, PORT)

type RabbitMQ struct {
	Connection *amqp.Connection
	Channel    *amqp.Channel
}

var rabbit = &RabbitMQ{}

var once sync.Once

var logger = slimlog.GetInstance()

func createConnection() *RabbitMQ {
	var connection *amqp.Connection
	var channel *amqp.Channel
	var lastError error
	const retries = 10

	for i := 0; i < retries; i++ {
		logger.Info("Connecting to RabbitMQ")
		tempConnection, connectionErr := amqp.Dial(CONNECTION_STRING)
		if connectionErr != nil {
			logger.Warn(connectionErr.Error(), zap.String("nextAction", "Will attempt to redial RabbitMQ."))
			lastError = connectionErr
			time.Sleep(time.Second * 2)
			continue
		}
		tempChannel, channelErr := tempConnection.Channel()
		if channelErr != nil {
			logger.Warn(connectionErr.Error(), zap.String("nextAction", "Will attempt to redial RabbitMQ."))
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

func CreateOrGetInstance() *RabbitMQ {
	once.Do(func() {
		rabbit = createConnection()
	})
	return rabbit
}
