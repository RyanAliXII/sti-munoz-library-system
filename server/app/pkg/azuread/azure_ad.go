package azuread

import (
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"

	"github.com/MicahParks/keyfunc"
)

var logger = slimlog.GetInstance()


var AdminAppClientId = os.Getenv("ADMIN_APP_CLIENT_ID")
var AdminAppTenantId = os.Getenv("ADMIN_APP_TENANT_ID")
var AdminAppId = os.Getenv("ADMIN_APP_ID")
var AdminAppJwksURL = fmt.Sprintf("https://login.microsoftonline.com/%s/discovery/v2.0/keys?appid=%s",AdminAppTenantId , AdminAppClientId)

var ClientAppClientId = os.Getenv("CLIENT_APP_CLIENT_ID")
var ClientAppTenantId = os.Getenv("CLIENT_APP_TENANT_ID")
var ClientAppId = os.Getenv("CLIENT_APP_ID")
var ClientAppJwksURL = fmt.Sprintf("https://login.microsoftonline.com/%s/discovery/v2.0/keys?appid=%s", ClientAppTenantId, ClientAppClientId)

var GRAPH_API_AUD = ""
var once sync.Once

var adminAppJwks *keyfunc.JWKS
var clientAppJwks *keyfunc.JWKS

func createJWKS(url string) *keyfunc.JWKS {
	const (
		EVERY_HOUR   = time.Hour * 1
		FIVE_MINUTES = time.Minute * 5
		TEN_SECONDS  = time.Second * 10
	)

	instance, err := keyfunc.Get(url, keyfunc.Options{
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
func GetorCreateAdminAppJWKSInstance() *keyfunc.JWKS {
	once.Do(func() {
		adminAppJwks = createJWKS(AdminAppJwksURL)
		
	})

	return adminAppJwks
}
func GetorCreateClientAppJWKSInstance() *keyfunc.JWKS {
	once.Do(func() {
		clientAppJwks = createJWKS(ClientAppJwksURL)
		
	})

	return clientAppJwks
}


