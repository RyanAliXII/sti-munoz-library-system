package main

import (
	"net/http"
	"os"

	"github.com/RyanAliXII/sti-munoz-library-system/server/api/v1"

	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/realtime"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

var logger *zap.Logger = slimlog.GetInstance()

func main() {

	ADMIN_APP := os.Getenv("ADMIN_APP_URL")
	CLIENT_APP := os.Getenv("CLIENT_APP_URL")
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(CustomLogger())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{ADMIN_APP, CLIENT_APP},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "x-xsrf-token", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))
	r.GET("/", func(ctx *gin.Context) {

		ctx.JSON(http.StatusOK, gin.H{
			"message": "Hello from server",
			"time":    time.Now(),
		})
	})
	
	azuread.GetOrCreateJwksInstance()
	dbConnection := postgresdb.GetOrCreateInstance()
	db.RunSeed(dbConnection)
	realtime.RealtimeRoutes(r.Group("/rt"))
	api.RegisterAPIV1(r)
	logger.Info("Server starting")

	r.Run(":5200")

}

func CustomLogger() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		start := time.Now()
		method := ctx.Request.Method
		statusCode := ctx.Writer.Status()
		clientIP := ctx.ClientIP()
		ctx.Next()
		latency := time.Since(start)
		path := ctx.Request.URL.Path
		if ctx.Writer.Status() >= 500 {
			logger.Error("Server Request", zap.String("path", path), zap.String("method", method), zap.Int("status", statusCode), zap.String("ip", clientIP), zap.String("duration", latency.String()))
		} else {
			logger.Info("Server Request", zap.String("path", path), zap.String("method", method), zap.Int("status", statusCode), zap.String("ip", clientIP), zap.String("duration", latency.String()))
		}
	}
}
