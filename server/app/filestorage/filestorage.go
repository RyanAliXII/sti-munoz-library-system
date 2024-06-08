package filestorage

import (
	"io"
	"time"
)

type Uploader interface {
	SetFile(file io.ReadSeeker)Uploader
	SetKey(key string) Uploader
	SetBucket(bucket string) Uploader
	SetContentType(contentType string) Uploader
	Upload()(string, error)
}
type UploadUrlGenerator interface {
	SetKey(key string)  UploadUrlGenerator
	SetBucket(bucket string) UploadUrlGenerator
	SetContentType(contentType string) UploadUrlGenerator
	SetExpiration(expire time.Duration) UploadUrlGenerator
	Generate()(string,error)
}
type FileStorage interface{
	Upload(key string, bucketName string , file io.ReadSeeker)(string, error)
	ListFiles(prefix string, bucket string)([]string, error)
	Delete(key string, bucket string)(error)
	Get(key string, bucket string)(io.ReadCloser, error)
	GenerateUploadRequestUrl(key string, bucket string)(string,error)
	GenerateGetRequestUrl(key string, bucket string)(string,error)
	NewUploader(key string, bucketName string , file io.ReadSeeker) Uploader
	NewUploadUrlGenerator(key string, bucket string) UploadUrlGenerator
}