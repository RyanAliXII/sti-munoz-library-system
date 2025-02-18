package applog

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)


func BuildLogger() *zap.Logger {
	cfg := zap.Config{
		Encoding:         "json",
		Level:            zap.NewAtomicLevel(),
		ErrorOutputPaths: []string{"stderr"},
		OutputPaths:      []string{"stdout", "app/logs/server.log"},
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
func New() *zap.Logger {
	var logger = BuildLogger()
	return logger
}
func Function(name string) zapcore.Field {
	return zap.String("function", name)
}
func Error(name string) zapcore.Field {
	return zap.String("error", name)
}
func AffectedRows(affected int64) zapcore.Field {
	return zap.Int64("affectedRows", affected)
}
