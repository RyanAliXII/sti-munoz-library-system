package postgresdb

import (
	"fmt"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/configmanager"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

var logger = slimlog.GetInstance()
func createConnection(config * configmanager.Config) *sqlx.DB {
	logger.Info("Connecting to Postgres database.")
	var driver = config.PostgreSQL.Driver
	var host = config.PostgreSQL.Host
	var port = config.PostgreSQL.Port
	var username = config.PostgreSQL.Username
	var password = config.PostgreSQL.Password
	var dbName = config.PostgreSQL.DBName
	connectionString := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable application_name=library-server", host, port, username, password, dbName)
	var connection *sqlx.DB
	var lastErr error
	const retries = 10
	for i := 0; i < retries; i++ {

		tempConnection, connectErr := sqlx.Connect(driver, connectionString)
		if connectErr != nil {
			logger.Warn(connectErr.Error(), zap.String("nextAction", "Will Attempt to reconnect to Postgres Database."))
			lastErr = connectErr
			time.Sleep(time.Second * 2)
			continue
		}
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
func New(config * configmanager.Config) *sqlx.DB {
	var db = createConnection(config)
	return db
}
