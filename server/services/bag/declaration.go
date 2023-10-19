package bag

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"

	"go.uber.org/zap"
)

var logger *zap.Logger = slimlog.BuildLogger()
