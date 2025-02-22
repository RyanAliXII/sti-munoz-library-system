package services

import (
	"fmt"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/configmanager"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"

	"github.com/MicahParks/keyfunc"
)

func createJWKS(config configmanager.Config) *keyfunc.JWKS {
	var logger = applog.New()
	const (
		EVERY_HOUR   = time.Hour * 1
		FIVE_MINUTES = time.Minute * 5
		TEN_SECONDS  = time.Second * 10
	)
	var appJwksURL = fmt.Sprintf("https://login.microsoftonline.com/%s/discovery/v2.0/keys?appid=%s", config.APIAppTenantID, config.APIAppClientID)
	 instance, err := keyfunc.Get(appJwksURL, keyfunc.Options{
			RefreshInterval:   EVERY_HOUR,
			RefreshTimeout:    TEN_SECONDS,
			RefreshRateLimit:  FIVE_MINUTES,
			RefreshUnknownKID: true,
			RefreshErrorHandler: func(err error) {
				logger.Error(err.Error(), applog.Error("jwks.RefreshErrorHandler"))
			},
	})
	if err != nil {
		panic(err)
	}
	
	return instance
}

func NewJWKS(config configmanager.Config) *keyfunc.JWKS{
	var jwks = createJWKS(config)
	return jwks
}


