package repository

import (
	"fmt"
	"io"
	"mime"
	"mime/multipart"
	"os"

	"github.com/jaevor/go-nanoid"
	"github.com/minio/minio-go/v7"
)

func (repo *Book)AddEbook(id string, eBook * multipart.FileHeader) error {
	file, err := eBook.Open()
	if err != nil {
		return err
	}
	defer file.Close()
	contentType := eBook.Header["Content-Type"][0]
	if contentType != "application/pdf" {
		return fmt.Errorf("content type not suppored: %s", contentType)
	}
	nanoid , err := nanoid.Standard(21)
	if err != nil {
		return err
	}
	exts, err  := mime.ExtensionsByType(contentType)
	if err != nil {
		return err
	}
	if exts == nil {
		return fmt.Errorf("no extension for specificied content type")
	}
	objectName := fmt.Sprintf("ebook/%s%s", nanoid(), exts[0])

	bucket := os.Getenv("S3_DEFAULT_BUCKET")
	key, err := repo.fileStorage.Upload(objectName, bucket, file)
	if err != nil {
		return err
	}
	_, err = repo.db.Exec("Update catalog.book set ebook = $1 where id = $2", key, id)
	if err != nil {
		return err
	}
	return nil
}
func (repo *Book)GetEbookById(id string) (io.ReadCloser, error) {
	ebookKey := ""
	err := repo.db.Get(&ebookKey, "SELECT ebook from book_view where id = $1", id)
	if err != nil {
	   return nil, err
	}

	if(len(ebookKey) == 0){
		return nil, &IsNotEbook{
			BookId: id,
		}
	}
	bucket := os.Getenv("S3_DEFAULT_BUCKET")
	object, err := repo.fileStorage.Get(ebookKey, bucket)
	if err != nil {
		return nil, err
	}
	
	return object, nil
}
func (repo *Book)RemoveEbookById(id string) error{
	ebookKey := ""
	err := repo.db.Get(&ebookKey, "SELECT ebook from book_view where id = $1", id)
	if err != nil {
		return err
	}
	bucket := os.Getenv("S3_DEFAULT_BUCKET")
	err = repo.fileStorage.Delete(ebookKey, bucket)
	if err != nil {
		if !(minio.ToErrorResponse(err).Code == "NoSuchKey") {
				return err
		}
	}
	_, err = repo.db.Exec("Update catalog.book set ebook = '' where id  = $1", id)
	if err != nil {
		 return err
	}

   return nil
}

func (repo *Book)UpdateEbookByBookId(id string,  eBook * multipart.FileHeader) error{
	file, err := eBook.Open()
	if err != nil {
		return err
	}
	defer file.Close()
	dbEbookKey := ""
	err = repo.db.Get(&dbEbookKey, "SELECT ebook from book_view where id = $1", id)
	if err != nil {
		return err
	}
	bucket := os.Getenv("S3_DEFAULT_BUCKET")
	if len(dbEbookKey) > 0 {
	err = repo.fileStorage.Delete(dbEbookKey, bucket)
	if err != nil {
		if !(minio.ToErrorResponse(err).Code == "NoSuchKey") {
				return err
		}
	}}
	contentType := eBook.Header["Content-Type"][0]
	if contentType != "application/pdf" {
		return fmt.Errorf("content type not suppored: %s", contentType)
	}
	nanoid , err := nanoid.Standard(21)
	if err != nil {
		return err
	}
	exts, err  := mime.ExtensionsByType(contentType)
	if err != nil {
		return err
	}
	if exts == nil {
		return fmt.Errorf("no extension for specificied content type")
	}
	objectName := fmt.Sprintf("ebook/%s%s", nanoid(), exts[0])

	key, err := repo.fileStorage.Upload(objectName, bucket,  file)
	if err != nil {
		return err
	}	
	_, err = repo.db.Exec("Update catalog.book set ebook = $1 where id = $2", key, id)
	if err != nil {
		return err
	}
	return nil
}