package repository

import (
	"context"
	"fmt"
	"mime/multipart"
	"path/filepath"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/objstore"
	"github.com/jaevor/go-nanoid"
	"github.com/minio/minio-go/v7"
)

type Content struct {
	objstore *minio.Client
}
type ContentRepository interface {

	UploadFile(file * multipart.FileHeader) (string, error) 
}

func NewContentRepository () ContentRepository {
	return &Content{
		objstore: objstore.GetorCreateInstance(),
	}
}
func (repo * Content)UploadFile(file * multipart.FileHeader) (string, error) {
	fileBuffer, err := file.Open()
	if err != nil {
		return "",err
	}
	defer fileBuffer.Close()

	canonicID, err := nanoid.Standard(21)
	if err!= nil {
		return "",err
	}
	ext := filepath.Ext(file.Filename)
	objectName := fmt.Sprintf("contents/%s%s", canonicID(), ext)
	fileSize := file.Size
	ctx := context.Background()
	contentType := file.Header["Content-Type"][0]
	info, err := repo.objstore.PutObject(ctx, objstore.BUCKET, objectName, fileBuffer, fileSize, minio.PutObjectOptions{
			ContentType: contentType,})
	if err != nil {
		return "",err
	}

	return info.Key, nil
}
