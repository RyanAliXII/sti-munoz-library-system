package repository

import (
	"mime/multipart"
)

type Content struct {
	
}
type ContentRepository interface {
	UploadFile(file * multipart.FileHeader) (string, error) 
}
func NewContentRepository () ContentRepository {
	return &Content{}
}
func (repo * Content)UploadFile(file * multipart.FileHeader) (string, error) {
	// fileBuffer, err := file.Open()
	// if err != nil {
	// 	return "",err
	// }
	// defer fileBuffer.Close()

	// canonicID, err := nanoid.Standard(21)
	// if err!= nil {
	// 	return "",err
	// }
	// ext := filepath.Ext(file.Filename)
	// objectName := fmt.Sprintf("contents/%s%s", canonicID(), ext)
	// fileSize := file.Size
	// ctx := context.Background()
	// contentType := file.Header["Content-Type"][0]
	// info, err := repo.minio.PutObject(ctx, minioclient.BUCKET, objectName, fileBuffer, fileSize, minio.PutObjectOptions{
	// 		ContentType: contentType,})
	// if err != nil {
	// 	return "",err
	// }

	return "", nil
}
