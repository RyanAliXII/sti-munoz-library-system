package services

import (
	"io"
	"os"
	"sync"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/filestorage"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)



type S3FileStorage struct {
	s3 * s3.S3
}
func(fs * S3FileStorage)Upload(key string, bucketName string , file io.ReadSeeker)(string, error){
	
	_, err := fs.s3.PutObject(&s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key: aws.String(key),
		Body: file,
	})
	if err != nil {
		return key, err
	}
	return key, nil
}
func(fs * S3FileStorage)ListFiles(prefix string, bucket string)([]string, error){
	results, err := fs.s3.ListObjects(&s3.ListObjectsInput{
		Bucket: aws.String(bucket),
		Prefix: aws.String(prefix),
	})
	if err != nil {
		return []string{}, err
	}
	var lists = make([]string, 0)
	for _, result := range results.Contents{
		lists = append(lists, *result.Key)
	}
	return lists, err
}
func(fs * S3FileStorage)Delete(key string, bucket string)(error){
	_, err := fs.s3.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(bucket),
		Key: aws.String(key),
	})
	if err != nil {
		return err
	}
	return nil
}
func(fs * S3FileStorage)Get(key string, bucket string) (io.ReadCloser, error) {
	result, err := fs.s3.GetObject(&s3.GetObjectInput{
		Key: aws.String(key),
		Bucket: aws.String(bucket),
	})

	if err != nil {
		 return nil, err
	}
	return result.Body, err
}
func(fs * S3FileStorage)GenerateUploadRequestUrl(key string, bucket string)(string,error){
	result, _:= fs.s3.PutObjectRequest(&s3.PutObjectInput{
		Bucket: aws.String(bucket),
		Key: aws.String(key),
	})
	url, err := result.Presign(15 * time.Minute)
	if err != nil {
		return "", err
	}
	return url, err
}
func(fs * S3FileStorage)GenerateGetRequestUrl(key string, bucket string)(string,error){
	result, _:= fs.s3.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key: aws.String(key),
	})
	url, err := result.Presign(15 * time.Minute)
	if err != nil {
		return "", err
	}
	return url, err
}
func(fs * S3FileStorage)NewUploader(key string, bucket string, file  io.ReadSeeker) filestorage.Uploader{
	return &S3FileUploader{
		key: key,
		bucket: bucket,
		file:  file,
		s3:  fs.s3,
		contentType: "application/octet-stream",
	}
}
func (fs * S3FileStorage)NewUploadUrlGenerator(key string, bucket string) filestorage.UploadUrlGenerator{
	return &S3UploadUrlGenerator{
		key: key,
		bucket: bucket,
		s3:  fs.s3,
		expiration: time.Minute * 15,
		contentType: "application/octet-stream",
	}
}
type S3FileUploader struct{
	contentType string
	key string
	bucket string
	file  io.ReadSeeker	
	s3 * s3.S3
}

func(fu * S3FileUploader)SetContentType(contentType string) filestorage.Uploader{
	fu.contentType = contentType
	return fu
}
func(fu * S3FileUploader)SetKey(key string) filestorage.Uploader{
	fu.key = key
	return fu
}
func(fu * S3FileUploader)SetBucket(bucket string) filestorage.Uploader{
	fu.bucket = bucket
	return fu
}
func (fu * S3FileUploader)SetFile(file io.ReadSeeker) filestorage.Uploader{
	fu.file = file
	return fu
}
func (fu * S3FileUploader)Upload()(string, error){
	_, err := fu.s3.PutObject(&s3.PutObjectInput{
		Bucket: aws.String(fu.bucket),
		Key: aws.String(fu.key),
		Body: fu.file,
		ContentType: aws.String(fu.contentType),
	})
	if err != nil {
		return fu.key, err
	}
	return fu.key, nil
}

type S3UploadUrlGenerator struct {
	contentType string
	key string
	bucket string
	s3 * s3.S3
	expiration time.Duration
}
func (ug * S3UploadUrlGenerator)SetBucket(bucket string) filestorage.UploadUrlGenerator{
	ug.bucket = bucket
	return ug
}
func(ug * S3UploadUrlGenerator)SetKey(key string) filestorage.UploadUrlGenerator{
	ug.key = key
	return ug
}
func(ug * S3UploadUrlGenerator)SetContentType(contentType string) filestorage.UploadUrlGenerator{
	ug.contentType = contentType
	return ug
}
func (ug * S3UploadUrlGenerator)SetExpiration(expire time.Duration) filestorage.UploadUrlGenerator{
	ug.expiration = expire
	return ug
}
func(ug * S3UploadUrlGenerator)Generate()(string,error){
	result, _:= ug.s3.PutObjectRequest(&s3.PutObjectInput{
		Bucket: aws.String(ug.bucket),
		Key: aws.String(ug.key),
	})
	url, err := result.Presign(ug.expiration)
	if err != nil {
		return "", err
	}
	return url, err
}

var s3FileStorage filestorage.FileStorage;
var once sync.Once
var PolicyJSONStr  = `
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Principal": {
				"AWS": [
					"*"
				]
			},
			"Action": [
				"s3:GetObject"
			],
			"Resource": [
				"arn:aws:s3:::sti-munoz-library/covers/*",
				"arn:aws:s3:::sti-munoz-library/profile-pictures/*",
				"arn:aws:s3:::sti-munoz-library/contents/*"
			]
		}
	]
}
`
func initS3FileStorage() (filestorage.FileStorage){
	var AccessKey = os.Getenv("S3_ACCESS_KEY")
    var SecretKey = os.Getenv("S3_SECRET_KEY")
	if(len(AccessKey) == 0 || len(SecretKey)== 0){
		panic("S3_ACCESS_KEY and S3_SECRET_KEY cannot be empty.")
	}
	region := "ap-southeast-1"
	session, err := session.NewSession(&aws.Config{
		Region: aws.String(region),
		Credentials: credentials.NewStaticCredentials(AccessKey, SecretKey, ""),
	})
	if err != nil {
		panic("S3 session cannot be established.")
	}
	var
	svc = s3.New(session)

	storage := &S3FileStorage{
		s3: svc,
	}
	return storage
}


func GetOrCreateS3FileStorage()filestorage.FileStorage{
	once.Do(func ()  {
       s3FileStorage = initS3FileStorage()
	})
	return s3FileStorage
}



