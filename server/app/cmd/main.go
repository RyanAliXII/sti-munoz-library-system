package main

import (
	"log"
	"net/http"
	"os"

	"github.com/RyanAliXII/sti-munoz-library-system/server/api/v1"
	"github.com/RyanAliXII/sti-munoz-library-system/server/routes"

	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/browser"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/loadtmpl"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/loadtmpl/funcmap"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/objstore"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/services/realtime"
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/postgres"
	"github.com/gin-gonic/autotls"
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
	r.Use(gin.Recovery())
	r.Use(CustomLogger())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{ADMIN_APP, CLIENT_APP, SCANNER_APP},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "x-xsrf-token", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))
	initSesssionStore(r)
	objstore.GetorCreateInstance()
	r.GET("/", func(ctx *gin.Context) {

		ctx.JSON(http.StatusOK, gin.H{
			"message": "STI MUNOZ LIBRARY",
			"time":    time.Now(),
		})
	})
	
	realtime.RealtimeRoutes(r.Group("/rt"))
	api.RegisterAPIV1(r)
	routes.Register(r)
	logger.Info("Server starting")
	ginMode := os.Getenv("GIN_MODE")
	if ginMode == "release" {
		domain := os.Getenv("SERVER_DOMAIN")
		log.Fatal(autotls.Run(r, domain))
	}else{
		r.Run(":5200")
	}
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


func initSesssionStore(router * gin.Engine){
	db := db.Connect()
	sessionSecret := os.Getenv("SESSION_SECRET")
	store, err := postgres.NewStore(db.DB,[]byte(sessionSecret))
	SCANNER_APP := os.Getenv("SCANNER_APP_URL")
	store.Options(sessions.Options{
		MaxAge: 60 * 60 * 16, // expired in 16 hrs
		Domain: SCANNER_APP,
		HttpOnly: true,
	})
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("NewStoreErr"), slimlog.Function("initSession"))
		return 
	}
	router.Use(sessions.Sessions("scanner_session", store))
}