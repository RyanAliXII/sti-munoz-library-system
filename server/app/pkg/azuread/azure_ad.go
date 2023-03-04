package azuread

import (
	"fmt"
	"os"
	"slim-app/server/app/pkg/slimlog"
	"sync"
	"time"

	"github.com/MicahParks/keyfunc"
)

var logger = slimlog.GetInstance()
var CLIENT_ID = os.Getenv("AZURE_AD_CLIENT")
var TENANT_ID = os.Getenv("AZURE_AD_TENANT")
var JWKS_URL = fmt.Sprintf("https://login.microsoftonline.com/%s/discovery/v2.0/keys?appid=%s", TENANT_ID, CLIENT_ID)
var APP_ID = os.Getenv("AZURE_APP_ID")

var GRAPH_API_AUD = ""
var once sync.Once

var jwks *keyfunc.JWKS

func createJWKS() *keyfunc.JWKS {
	const (
		EVERY_HOUR   = time.Hour * 1
		FIVE_MINUTES = time.Minute * 5
		TEN_SECONDS  = time.Second * 10
	)

	instance, err := keyfunc.Get(JWKS_URL, keyfunc.Options{
		RefreshInterval:   EVERY_HOUR,
		RefreshTimeout:    TEN_SECONDS,
		RefreshRateLimit:  FIVE_MINUTES,
		RefreshUnknownKID: true,
		RefreshErrorHandler: func(err error) {
			logger.Error(err.Error(), slimlog.Error("jwks.RefreshErrorHandler"))
		},
	})

	if err != nil {
		logger.Error(err.Error(), slimlog.Function("createJwksErr"))
	}
	return instance
}
func GetorCreateJWKSInstance() *keyfunc.JWKS {
	once.Do(func() {
		jwks = createJWKS()
	})

	return jwks
}
