package repository

import (
	"context"
	"fmt"
	"mime/multipart"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/objstore"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/objstore/utils"
	"github.com/jaevor/go-nanoid"
	"github.com/minio/minio-go/v7"
)

func (repo * BookRepository)AddEbook(id string, eBook * multipart.FileHeader) error {
	file, err := eBook.Open()
	if err != nil {
		return err
	}
	defer file.Close()

	if err != nil {
		return err
	}
	contentType := eBook.Header["Content-Type"][0]
	if contentType != "application/pdf" {
		return fmt.Errorf("content type not suppored: %s", contentType)
	}
	nanoid , err := nanoid.Standard(21)
	if err != nil {
		return err
	}
	ctx := context.Background()
	ext := utils.GetFileExtBasedOnContentType(contentType)
	objectName := fmt.Sprintf("ebook/%s%s", nanoid(), ext)
	fileSize := eBook.Size
	result, err := repo.minio.PutObject(ctx, objstore.BUCKET, objectName, file, fileSize, minio.PutObjectOptions{
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
func (repo * BookRepository)GetEbookById(id string) (*minio.Object, error) {
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
	object, err := repo.minio.GetObject(ctx, objstore.BUCKET, ebookKey, minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}
	
	return object, nil
}
func (repo * BookRepository)RemoveEbookById(id string) error{
	ebookKey := ""
	err := repo.db.Get(&ebookKey, "SELECT ebook from book_view where id = $1", id)
	if err != nil {
		return err
	}
	ctx := context.Background()
	err = repo.minio.RemoveObject(ctx, objstore.BUCKET, ebookKey, minio.RemoveObjectOptions{})
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

func (repo * BookRepository)UpdateEbookByBookId(id string,  eBook * multipart.FileHeader) error{
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
	err = repo.minio.RemoveObject(ctx, objstore.BUCKET,dbEbookKey, minio.RemoveObjectOptions{})
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
	
	ext := utils.GetFileExtBasedOnContentType(contentType)
	objectName := fmt.Sprintf("ebook/%s%s", nanoid(), ext)
	fileSize := eBook.Size
	result, err := repo.minio.PutObject(ctx, objstore.BUCKET, objectName, file, fileSize, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return err
	}	
	if err != nil {
		return err
	}

	_, err = repo.db.Exec("Update catalog.book set ebook = $1 where id = $2", result.Key, id)
	if err != nil {
		return err
	}
	return nil
}