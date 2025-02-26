package main

import (
	"net/http"

	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/configmanager"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/browser"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/loadtmpl"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/loadtmpl/funcmap"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/rabbitmq"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/realtime"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/permissionstore"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func main() {
	var logger *zap.Logger = applog.New()
	var config = configmanager.LoadConfig();
	browser, err  := browser.NewBrowser()
	if err != nil {
		logger.Error(err.Error())
	}
	defer browser.Close()
	r := gin.New()
	r.SetFuncMap(funcmap.FuncMap)
	r.LoadHTMLFiles(loadtmpl.LoadHTMLFiles("./templates")...)
	r.Static("/assets", "./assets")
	r.Use(gin.Recovery())
	r.Use(CustomLogger(logger))
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{config.AdminAppURL, config.ClientAppURL, config.ScannerAppURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "x-xsrf-token", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))
	
	db := postgresdb.New(config)
	defer db.Close()
	rabbitmq := rabbitmq.New(config)
	defer rabbitmq.Connection.Close()
	fileStorage := services.NewS3FileStorge(config)
	var postgresPermissionStore = permissionstore.NewPostgresPermissionStore(db)
	var permissionStore = permissionstore.New(postgresPermissionStore)
	jwks := services.NewJWKS(*config)
	defer jwks.EndBackground()

	services := services.BuildServices(&services.ServicesDependency{
		Db: db,
		RabbitMQ: rabbitmq,
		FileStorage: fileStorage,
		Config: config,
		PermissionStore: permissionStore,
		Logger: logger,
		Jwks: jwks,
	});
	realtime.RealtimeRoutes(r.Group("/rt"), &services)
	controllers.RegisterAPIV1(r, &services)
	controllers.Register(r, &services);
	logger.Info("Server starting")
	r.GET("/", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"message": "STI MUNOZ LIBRARY",
		})
	})
    r.Run(":5200")
}

func CustomLogger(logger *zap.Logger) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		method := ctx.Request.Method
		if method == "OPTIONS" {
			return
		}

		start := time.Now()
		ctx.Next() // Process the request before logging

		statusCode := ctx.Writer.Status() // Get the correct status after processing
		clientIP := ctx.ClientIP()
		latency := time.Since(start)
		path := ctx.Request.URL.Path

		if statusCode >= 400 {
			logger.Error("Server Request",
				zap.String("path", path),
				zap.String("method", method),
				zap.Int("status", statusCode),
				zap.String("ip", clientIP),
				zap.String("duration", latency.String()))
		} else {
			logger.Info("Server Request",
				zap.String("path", path),
				zap.String("method", method),
				zap.Int("status", statusCode),
				zap.String("ip", clientIP),
				zap.String("duration", latency.String()))
		}
	}
}
