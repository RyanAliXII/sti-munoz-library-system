package objstore

import (
	"context"
	"log"
	"os"
	"sync"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var ENDPOINT = os.Getenv("MINIO_ENDPOINT")
var ACCESS_KEY = os.Getenv("MINIO_ACCESS_KEY")
var SECRET_KEY = os.Getenv("MINIO_SECRET_KEY")
var USE_SSL = false

var once sync.Once
var client *minio.Client

func createConnection() *minio.Client {
	ctx := context.Background()
	client, initErr := minio.New(ENDPOINT, &minio.Options{
		Creds:  credentials.NewStaticV4(ACCESS_KEY, SECRET_KEY, ""),
		Secure: USE_SSL,
	})
	if initErr != nil {
		panic(initErr)
	}

	bucketName := "sti.munoz.edsa"
	location := "ap-southeast-1"

	err := client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{Region: location})
	if err != nil {
		// Check to see if we already own this bucket (which happens if you run this twice)
		exists, errBucketExists := client.BucketExists(ctx, bucketName)
		if errBucketExists == nil && exists {
			log.Printf("We already own %s\n", bucketName)
		} else {
			log.Fatalln(err)
		}
	} else {
		log.Printf("Successfully created %s\n", bucketName)
	}
	return client
}

func GetorCreateInstance() *minio.Client {
	once.Do(func() {
		client = createConnection()
	})
	return client
}
