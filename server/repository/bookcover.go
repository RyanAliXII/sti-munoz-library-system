package repository

import (
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/doug-martin/goqu/v9"
	"github.com/jaevor/go-nanoid"
	"go.uber.org/zap"
)
func (repo *Book) NewBookCover(bookId string, covers []*multipart.FileHeader) error {

	dialect := goqu.Dialect("postgres")
	canonicID, nanoIdErr := nanoid.Standard(21)
	if nanoIdErr != nil {
		logger.Error(nanoIdErr.Error(), slimlog.Function("BookRepository.UploadBookCover"), slimlog.Error("nanoIdErr"))
		return nanoIdErr
	}
	bookCoverRows := make([]goqu.Record, 0)
	bucket := os.Getenv("S3_DEFAULT_BUCKET")
	for idx, cover := range covers {
		extension := filepath.Ext(cover.Filename)
		objectName := fmt.Sprintf("covers/%s/%s%s", bookId, canonicID(), extension)
		fileBuffer, err := cover.Open()
		if err != nil {
			return err
		}
		defer fileBuffer.Close()
		contentType := cover.Header["Content-Type"][0]
		if contentType != "image/jpeg" && contentType != "image/jpg" && contentType != "image/png" && contentType != "image/webp"{
			err := repo.removeAlreadyUploadedImage(idx, bookCoverRows)
			if err != nil {
				return err
			}
			return fmt.Errorf("content type not supported : %s ", contentType)
		}
		resultKey, err := repo.fileStorage.NewUploader(objectName, bucket, fileBuffer).SetContentType(contentType).Upload()
		if err != nil {
			err := repo.removeAlreadyUploadedImage(idx, bookCoverRows)
			if err != nil {
				return err
			}
			return err
		}
		
		bookCoverRows = append(bookCoverRows, goqu.Record{
			"path":    resultKey,
			"book_id": bookId,
		})
		logger.Info("Book cover uploaded.", zap.String("bookId", bookId), zap.String("s3Key", resultKey))

	}
	ds := dialect.From(goqu.T("book_cover").Schema("catalog")).Prepared(true).Insert().Rows(bookCoverRows)

	query, args, _ := ds.ToSQL()

	_, insertCoverErr := repo.db.Exec(query, args...)

	if insertCoverErr != nil {
		err := repo.removeAlreadyUploadedImage(len(bookCoverRows), bookCoverRows)
			if err != nil {
				return err
		}
		logger.Error(insertCoverErr.Error(), slimlog.Function("BookRepository.NewBookCover"), slimlog.Error("insertCoverErr"))
		return insertCoverErr
	}
	return nil
}
func(repo * Book) removeAlreadyUploadedImage(idx int, records []goqu.Record)error{
	bucket := os.Getenv("S3_DEFAULT_BUCKET")
	for i := 0; i < idx; i++{
		record := records[i]
		path := record["path"].(string)
		err := repo.fileStorage.Delete(path, bucket)
		if err != nil {
			return err
		}
		
	}
	return nil
}

func (repo *Book) UpdateBookCover(bookId string, covers []*multipart.FileHeader) error {
	dialect := goqu.Dialect("postgres")
	path := fmt.Sprintf("covers/%s/", bookId)
	canonicID, nanoIdErr := nanoid.Standard(21)
	if nanoIdErr != nil {
		logger.Error(nanoIdErr.Error(), slimlog.Function("BookRepository.UpdateBookCover"), slimlog.Error("nanoIdErr"))
		return nanoIdErr
	}
    
	bucket := os.Getenv("S3_DEFAULT_BUCKET")
	objectKeys, err := repo.fileStorage.ListFiles(path,  bucket)
	
	if err != nil {
		return err
	}
	//map old uploaded book covers.
	oldCoversMap := make(map[string]string)

	for _, objKey := range objectKeys {
		oldCoversMap[objKey] = objKey
	}
	newCoversMap := make(map[string]*multipart.FileHeader)
	bookCoverRows := make([]goqu.Record, 0)

	//check if book covers are already uploaded. If not, uploud.
	for idx, cover := range covers {
		key := fmt.Sprintf("%s%s", path, cover.Filename)
		_, isAlreadyUploaded := oldCoversMap[key]
		if !isAlreadyUploaded {
			extension := filepath.Ext(cover.Filename)
			objectName := fmt.Sprintf("%s%s%s", path, canonicID(), extension)
			fileBuffer, _ := cover.Open()
			defer fileBuffer.Close()
			contentType := cover.Header["Content-Type"][0]
			if contentType != "image/jpeg" && contentType != "image/jpg" && contentType != "image/png" && contentType != "image/webp"{
				err := repo.removeAlreadyUploadedImage(idx,  bookCoverRows)
				if err != nil {
					err := repo.removeAlreadyUploadedImage(idx, bookCoverRows)
					return err
				}
				return fmt.Errorf("content type not supported : %s ", contentType)
			}
			key, err := repo.fileStorage.NewUploader(objectName, bucket, fileBuffer).SetContentType(contentType).Upload()
			if err != nil {
				err := repo.removeAlreadyUploadedImage(idx, bookCoverRows)
				return err
			}
			//store new cover to be inserted later
			bookCoverRows = append(bookCoverRows, goqu.Record{
				"path":   key,
				"book_id": bookId,
			})
			logger.Info("Book cover uploaded.", zap.String("bookId", bookId), zap.String("s3Key", key))
		}
		newCoversMap[key] = cover
	}
	transaction, transactErr := repo.db.Beginx()

	if transactErr != nil {
		transaction.Rollback()
		return transactErr
	}

	// check if old covers are removed, if removed, delete from object storage
	for _, oldCover := range oldCoversMap {
		key := oldCover
		_, stillExist := newCoversMap[key]
		if !stillExist {
			err := repo.fileStorage.Delete(key, bucket)
			if err != nil {
				transaction.Rollback()
		
				return err
			}
			_, deleteErr := transaction.Exec("Delete from catalog.book_cover where book_id= $1 AND path = $2  ", bookId, key)
			//delete from db
			if deleteErr != nil {
				transaction.Rollback()
				logger.Error(deleteErr.Error(), slimlog.Function("BookRepository.UpdateBookCover"), slimlog.Error("deleteErr"))
				return deleteErr
			}
		}

	}
	// insert new uploaded cover to db.
	insertDs := dialect.From(goqu.T("book_cover").Schema("catalog")).Prepared(true).Insert().Rows(bookCoverRows)
	query, args, _ := insertDs.ToSQL()
	_, insertErr := transaction.Exec(query, args...)

	if insertErr != nil {
		transaction.Rollback()
		logger.Error(insertErr.Error(), slimlog.Function("BookRepository.UpdateBookCover"), slimlog.Error("insertErr"))
		return insertErr
	}
	transaction.Commit()
	return nil
}
func (repo *Book) DeleteBookCoversByBookId(bookId string) error {
	path := fmt.Sprintf("covers/%s/", bookId)
	bucket := os.Getenv("S3_DEFAULT_BUCKET")
	objects, err  := repo.fileStorage.ListFiles(path, bucket)
	if err != nil {
		return err
	}
	for _, objectKey := range objects {
		err := repo.fileStorage.Delete(objectKey, bucket)
		if err != nil { return err}
	}
	_, err = repo.db.Exec("DELETE FROM catalog.book_cover where book_id = $1", bookId)
	if err != nil {
		logger.Error(err.Error(), slimlog.Function("BookRepository.DeleteBookCoversByBookId"), slimlog.Error("deleteErr"))
		return err
	}
	return nil
}