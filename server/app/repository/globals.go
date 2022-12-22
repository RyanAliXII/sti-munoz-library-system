package repository

import (
	"slim-app/server/app/pkg/slimlog"

	"go.uber.org/zap"
)

// put all global declaration of vars in a packages
var logger *zap.Logger = slimlog.GetInstance()
