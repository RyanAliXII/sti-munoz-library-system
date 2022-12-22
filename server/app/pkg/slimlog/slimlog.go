package slimlog

import (
	"sync"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var logger *zap.Logger
var once sync.Once

func BuildLogger() *zap.Logger {
	cfg := zap.Config{
		Encoding:         "json",
		Level:            zap.NewAtomicLevel(),
		ErrorOutputPaths: []string{"stderr"},
		OutputPaths:      []string{"stdout", "app/logs/slim.log"},
		EncoderConfig: zapcore.EncoderConfig{
			MessageKey:  "message",
			LevelKey:    "level",
			TimeKey:     "time",
			EncodeLevel: zapcore.CapitalLevelEncoder,
			EncodeTime:  zapcore.EpochTimeEncoder,
		},
	}
	logger, err := cfg.Build()
	if err != nil {
		panic(err.Error())
	}
	return logger

}
func GetInstance() *zap.Logger {
	once.Do(func() {
		logger = BuildLogger()
	})
	return logger
}
