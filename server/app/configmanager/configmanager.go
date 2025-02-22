package configmanager

import (
	"os"
)

type postgreSQLConfig struct {
	Username     string
	Password string
	DBName   string
	Host     string
	Port     string
	Driver   string
}

type awsConfig struct {
	AccessKey       string
	SecretKey       string
	DefaultBucket   string
	Endpoint        string
	Region          string
	ForcePathStyle  string
	URL             string
}

type pgAdminConfig struct {
	Email    string
	Password string
}

type rabbitMQConfig struct {
	User string
	Password string
	Host string
	Port string
}

type Config struct {
	PostgreSQL postgreSQLConfig
	AWS        awsConfig
	PGAdmin    pgAdminConfig
	RabbitMQ   rabbitMQConfig

	AdminAppURL       string
	ClientAppURL      string
	ScannerAppURL     string
	ScannerAppDomain  string
	ServerURL         string
	WSURL             string
	WSClientURL       string
	ServerDomain      string
	JWTSecret         string
	CryptoSecret      string
	AdminAppClientID  string
	AdminAppTenantID  string
	AdminAppID        string
	ClientAppClientID string
	ClientAppTenantID string
	ClientAppID       string
	APIAppID          string
	APIAppTenantID    string
	APIAppClientID    string
}

func LoadConfig() *Config {
	return &Config{
		PostgreSQL: postgreSQLConfig{
			Username:  os.Getenv("DB_USERNAME"),
			Password: os.Getenv("DB_PASSWORD"),
			DBName:   os.Getenv("DB_NAME"),
			Host:     os.Getenv("DB_HOST"),
			Port:     os.Getenv("DB_PORT"),
			Driver:   os.Getenv("DB_DRIVER"),
		},
		AWS: awsConfig{
			AccessKey:      os.Getenv("S3_ACCESS_KEY"),
			SecretKey:      os.Getenv("S3_SECRET_KEY"),
			DefaultBucket:  os.Getenv("S3_DEFAULT_BUCKET"),
			Endpoint:       os.Getenv("S3_ENDPOINT"),
			Region:         os.Getenv("S3_REGION"),
			ForcePathStyle: os.Getenv("S3_FORCE_PATH_STYLE"),
			URL:            os.Getenv("S3_URL"),
		},
		PGAdmin: pgAdminConfig{
			Email:    os.Getenv("PGADMIN_DEFAULT_EMAIL"),
			Password: os.Getenv("PGADMIN_DEFAULT_PASSWORD"),
		},
		RabbitMQ: rabbitMQConfig{
			User: os.Getenv("RABBITMQ_DEFAULT_USER"),
			Password: os.Getenv("RABBITMQ_DEFAULT_PASS"),
			Host: os.Getenv("RABBITMQ_HOST"),
			Port: os.Getenv("RABBITMQ_PORT"),
		},
		AdminAppURL:       os.Getenv("ADMIN_APP_URL"),
		ClientAppURL:      os.Getenv("CLIENT_APP_URL"),
		ScannerAppURL:     os.Getenv("SCANNER_APP_URL"),
		ScannerAppDomain:  os.Getenv("SCANNER_APP_DOMAIN"),
		ServerURL:         os.Getenv("SERVER_URL"),
		WSURL:             os.Getenv("WS_URL"),
		WSClientURL:       os.Getenv("WS_CLIENT_URL"),
		ServerDomain:      os.Getenv("SERVER_DOMAIN"),
		JWTSecret:         os.Getenv("JWT_SECRET"),
		CryptoSecret:      os.Getenv("CRYPTO_SECRET"),
		AdminAppClientID:  os.Getenv("ADMIN_APP_CLIENT_ID"),
		AdminAppTenantID:  os.Getenv("ADMIN_APP_TENANT_ID"),
		AdminAppID:        os.Getenv("ADMIN_APP_ID"),
		ClientAppClientID: os.Getenv("CLIENT_APP_CLIENT_ID"),
		ClientAppTenantID: os.Getenv("CLIENT_APP_TENANT_ID"),
		ClientAppID:       os.Getenv("CLIENT_APP_ID"),
		APIAppID:          os.Getenv("APP_ID"),
		APIAppTenantID:    os.Getenv("TENANT_ID"),
		APIAppClientID:    os.Getenv("CLIENT_ID"),
	}
}