package repository

import (
	"context"
	"fmt"
	"mime"
	"mime/multipart"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/minioclient"

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
	ctx := context.Background()
	exts, err  := mime.ExtensionsByType(contentType)
	if err != nil {
		return err
	}
	if exts == nil {
		return fmt.Errorf("no extension for specificied content type")
	}
	objectName := fmt.Sprintf("ebook/%s%s", nanoid(), exts[0])
	fileSize := eBook.Size
	result, err := repo.minio.PutObject(ctx, minioclient.BUCKET, objectName, file, fileSize, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return err
	}
	_, err = repo.db.Exec("Update catalog.book set ebook = $1 where id = $2", result.Key, id)
	if err != nil {
		return err
	}
	return nil
}
func (repo *Book)GetEbookById(id string) (*minio.Object, error) {
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
	ctx := context.Background()
	object, err := repo.minio.GetObject(ctx, minioclient.BUCKET, ebookKey, minio.GetObjectOptions{})
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
	ctx := context.Background()
	err = repo.minio.RemoveObject(ctx, minioclient.BUCKET, ebookKey, minio.RemoveObjectOptions{})
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
	ctx := context.Background()	
	if len(dbEbookKey) > 0 {
	err = repo.minio.RemoveObject(ctx, minioclient.BUCKET,dbEbookKey, minio.RemoveObjectOptions{})
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
	fileSize := eBook.Size
	result, err := repo.minio.PutObject(ctx, minioclient.BUCKET, objectName, file, fileSize, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return err
	}	
	_, err = repo.db.Exec("Update catalog.book set ebook = $1 where id = $2", result.Key, id)
	if err != nil {
		return err
	}
	return nil
}