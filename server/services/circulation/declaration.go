package circulation

import (
	"slim-app/server/app/pkg/slimlog"

	"go.uber.org/zap"
)

var logger *zap.Logger = slimlog.BuildLogger()