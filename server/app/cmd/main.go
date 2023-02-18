package main

import (
	"net/http"
	"os"
	"slim-app/server/api/v1"
	"slim-app/server/app/db"
	"slim-app/server/app/pkg/rabbitmq"
	"slim-app/server/app/pkg/slimlog"
	"slim-app/server/repository"
	"slim-app/server/services/realtime"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

var logger *zap.Logger = slimlog.GetInstance()

func main() {

	ADMIN_APP := os.Getenv("SPA_ADMIN_URL")
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(CustomLogger())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{ADMIN_APP},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "x-xsrf-token"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))
	r.GET("/", func(ctx *gin.Context) {

		ctx.JSON(http.StatusOK, gin.H{
			"message": "Hello from server",
			"time":    time.Now(),
		})
	})
	dbConnection := db.Connect()
	defer dbConnection.Close()
	rabbitMq := rabbitmq.New()
	defer rabbitMq.Connection.Close()

	db.RunSeed(dbConnection)
	repos := repository.NewRepositories(dbConnection, rabbitMq)
	realtime.RealtimeRoutes(r.Group("/rt"), &repos)
	api.RegisterAPIV1(r, &repos)
	logger.Info("Server starting")
	r.Run(":5200")

}

func CustomLogger() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Next()
		method := ctx.Request.Method
		statusCode := ctx.Writer.Status()
		clientIP := ctx.ClientIP()

		path := ctx.Request.URL.Path
		if ctx.Writer.Status() >= 500 {
			logger.Error("Server Request", zap.String("path", path), zap.String("method", method), zap.Int("status", statusCode), zap.String("ip", clientIP))
		} else {
			logger.Info("Server Request", zap.String("path", path), zap.String("method", method), zap.Int("status", statusCode), zap.String("ip", clientIP))
		}
	}
}
