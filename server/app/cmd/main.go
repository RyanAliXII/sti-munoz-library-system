package main

import (
	"net/http"
	"os"

	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers"
	"github.com/RyanAliXII/sti-munoz-library-system/server/controllers/v1/realtime"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services"

	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/browser"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/loadtmpl"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/loadtmpl/funcmap"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/permissionstore"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

var logger *zap.Logger = slimlog.GetInstance()

func main() {

	ADMIN_APP := os.Getenv("ADMIN_APP_URL")
	CLIENT_APP := os.Getenv("CLIENT_APP_URL")

	SCANNER_APP := os.Getenv("SCANNER_APP_URL")
	browser, err  := browser.NewBrowser()
	if err != nil {
		logger.Error(err.Error())
	}
	defer browser.GetBrowser().Close()
	defer browser.GetLauncher().Close()

	r := gin.New()
	r.SetFuncMap(funcmap.FuncMap)
	r.LoadHTMLFiles(loadtmpl.LoadHTMLFiles("./templates")...)
	r.Static("/assets", "./assets")
	r.Use(gin.Recovery())
	r.Use(CustomLogger())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{ADMIN_APP, CLIENT_APP, SCANNER_APP},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "x-xsrf-token", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	permissionstore.GetPermissionStore()
	r.GET("/", func(ctx *gin.Context) {

		ctx.JSON(http.StatusOK, gin.H{
			"message": "STI MUNOZ LIBRARY",
			"time":    time.Now(),
		})
	})
	services := services.BuildServices();
	realtime.RealtimeRoutes(r.Group("/rt"), &services)
	controllers.RegisterAPIV1(r, &services)
	controllers.Register(r, &services);
	logger.Info("Server starting")
    r.Run(":5200")
}

func CustomLogger() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		method := ctx.Request.Method
		if(method == "OPTIONS"){
			return
		}
		start := time.Now()
		statusCode := ctx.Writer.Status()
		clientIP := ctx.ClientIP()
		ctx.Next()
		latency := time.Since(start)
		path := ctx.Request.URL.Path
		
		if ctx.Writer.Status() >= 400 {
			logger.Error("Server Request", zap.String("path", path), zap.String("method", method), zap.Int("status", statusCode), zap.String("ip", clientIP), zap.String("duration", latency.String()))
		} else {
			logger.Info("Server Request", zap.String("path", path), zap.String("method", method), zap.Int("status", statusCode), zap.String("ip", clientIP), zap.String("duration", latency.String()))
		}
	}
}
