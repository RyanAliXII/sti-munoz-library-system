package postgresdb

import (
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

var DRIVER = os.Getenv("DB_DRIVER")
var HOST = os.Getenv("DB_HOST")
var PORT = os.Getenv("DB_PORT")
var USERNAME = os.Getenv("DB_USERNAME")
var PASSWORD = os.Getenv("DB_PASSWORD")
var DB_NAME = os.Getenv("DB_NAME")

var once sync.Once
var db *sqlx.DB
var logger = slimlog.GetInstance()

func createConnection() *sqlx.DB {
	logger.Info("Connecting to Postgres database.")
	CONNECTION_STRING := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable application_name=library-server", HOST, PORT, USERNAME, PASSWORD, DB_NAME)

	var connection *sqlx.DB
	var lastErr error
	const retries = 10
	for i := 0; i < retries; i++ {

		tempConnection, connectErr := sqlx.Connect(DRIVER, CONNECTION_STRING)
		if connectErr != nil {
			logger.Warn(connectErr.Error(), zap.String("nextAction", "Will Attempt to reconnect to Postgres Database."))
			lastErr = connectErr
			time.Sleep(time.Second * 2)
			continue
		}
		tempConnection.DB.SetMaxOpenConns(20)
		tempConnection.DB.SetMaxIdleConns(5)
		connection = tempConnection
		lastErr = nil
		break
	}
	if lastErr != nil {
		logger.Error(lastErr.Error(), slimlog.Error("Failed to connect to postgres database."))
		panic(lastErr.Error())
	}
	logger.Info("Successfully connected to Postgres database.")
	return connection
}
func GetOrCreateInstance() *sqlx.DB {
	once.Do(func() {
		db = createConnection()
	})
	return db
}
