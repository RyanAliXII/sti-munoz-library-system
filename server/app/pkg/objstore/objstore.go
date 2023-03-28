package objstore

import (
	"context"
	"fmt"
	"os"
	"sync"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"go.uber.org/zap"
)

var ENDPOINT = os.Getenv("MINIO_ENDPOINT")
var ACCESS_KEY = os.Getenv("MINIO_ACCESS_KEY")
var SECRET_KEY = os.Getenv("MINIO_SECRET_KEY")
var logger = slimlog.GetInstance()
var USE_SSL = false
var BUCKET = "sti.munoz.edsa.library"
var once sync.Once
var client *minio.Client

func createConnection() *minio.Client {
	fmt.Println(ACCESS_KEY)
	fmt.Println(SECRET_KEY)
	ctx := context.Background()
	client, initErr := minio.New(ENDPOINT, &minio.Options{
		Creds:  credentials.NewStaticV4(ACCESS_KEY, SECRET_KEY, ""),
		Secure: USE_SSL,
	})
	if initErr != nil {
		panic(initErr)
	}

	location := "ap-southeast-1"

	err := client.MakeBucket(ctx, BUCKET, minio.MakeBucketOptions{
		Region: location,
	})

	if err != nil {
		exists, errBucketExists := client.BucketExists(ctx, BUCKET)
		if errBucketExists == nil && exists {
			logger.Info("Bucket has already existed.", zap.String("bucketName", BUCKET))
		} else {
			logger.Error(err.Error())
		}
	} else {
		logger.Info("Bucket successfully created.", zap.String("bucketName", BUCKET))
	}

	return client
}

func GetorCreateInstance() *minio.Client {
	once.Do(func() {
		client = createConnection()
	})
	return client
}
