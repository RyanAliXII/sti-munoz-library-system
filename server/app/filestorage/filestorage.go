package filestorage

import "io"


type FileStorage interface{
	Upload(objectName string, bucketName string , file io.ReadSeeker)(string, error)
}