package filestorage

import "io"


type FileStorage interface{
	Upload(key string, bucketName string , file io.ReadSeeker)(string, error)
	ListFiles(prefix string, bucket string)([]string, error)
	Delete(key string, bucket string)(error)
	Get(key string, bucket string)(io.ReadCloser, error)
	GenerateUploadRequestUrl(key string, bucket string)(string,error)
	GenerateGetRequestUrl(key string, bucket string)(string,error)
}