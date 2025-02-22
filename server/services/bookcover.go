package services

import (
	"fmt"
	"mime/multipart"
	"path/filepath"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/configmanager"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/filestorage"
	"github.com/jaevor/go-nanoid"
)

type BookCoverService struct{
	storage  filestorage.FileStorage
	config * configmanager.Config
}
func NewBookCoverService(fileStorage filestorage.FileStorage) BookCoverService{
	return BookCoverService{
		storage: fileStorage,
	}
}
func(service * BookCoverService)NewCovers(bookId string, covers []*multipart.FileHeader)([]string, error){
	var result = make([]string, 0)
	canonicID, err := nanoid.Standard(21)
	if err != nil {
		return result, err
	}
	
	bucket := service.config.AWS.DefaultBucket
	for _, cover := range covers {
		extension := filepath.Ext(cover.Filename)
		objectName := fmt.Sprintf("covers/%s/%s%s", bookId, canonicID(), extension)
		fileBuffer, err := cover.Open()
		if err != nil {
			return result, err
		}
		defer fileBuffer.Close()
		contentType := cover.Header["Content-Type"][0]
		if contentType != "image/jpeg" && contentType != "image/jpg" && contentType != "image/png" && contentType != "image/webp"{
			err := service.DeleteCovers(result);
			if err != nil {
				return result, err
			}
			return result, fmt.Errorf("content type not supported : %s ", contentType)
		}
		key, err := service.storage.NewUploader(objectName, bucket, fileBuffer).SetContentType(contentType).Upload()
		if err != nil {
			service.DeleteCovers(result)
			return result, nil
		}
		result = append(result, key)
	
	}
	return result, nil
}	
func(service * BookCoverService)DeleteCovers(keys []string) error{
	bucket := service.config.AWS.DefaultBucket
	for _, key := range keys{
		err := service.storage.Delete(key, bucket)
		if err != nil {
			return err
		}
	}
	return nil
}
func(service *BookCoverService)UpdateBookCovers(bookId string,  covers []*multipart.FileHeader) ([]string, []string, error){
	//dialect := goqu.Dialect("postgres")
	path := fmt.Sprintf("covers/%s/", bookId)
	var uploaded = make([]string, 0)
	var deleted  = make([]string, 0)
	canonicID, err := nanoid.Standard(21)
	if err != nil {
		return uploaded, deleted, err
	}
    
	bucket := service.config.AWS.DefaultBucket
	objectKeys, err := service.storage.ListFiles(path,  bucket)

	if err != nil {
		return uploaded, deleted, err
	}
	//map old uploaded book covers.
	oldCoversMap := make(map[string]string)
	for _, objKey := range objectKeys {
		oldCoversMap[objKey] = objKey
	}
	newCoversMap := make(map[string]*multipart.FileHeader)
	
	//check if book covers are already uploaded. If not, uploud.
	for _, cover := range covers {
		key := fmt.Sprintf("%s%s", path, cover.Filename)
		_, isAlreadyUploaded := oldCoversMap[key]
		if !isAlreadyUploaded {
			extension := filepath.Ext(cover.Filename)
			objectName := fmt.Sprintf("%s%s%s", path, canonicID(), extension)
			fileBuffer, _ := cover.Open()
			defer fileBuffer.Close()
			contentType := cover.Header["Content-Type"][0]
			if contentType != "image/jpeg" && contentType != "image/jpg" && contentType != "image/png" && contentType != "image/webp"{
				deleteErr := service.DeleteCovers(uploaded)
				if deleteErr != nil {
					return uploaded, deleted, deleteErr
				}
				return uploaded, deleted, fmt.Errorf("content type not supported : %s ", contentType)
			}
			key, err := service.storage.NewUploader(objectName, bucket, fileBuffer).SetContentType(contentType).Upload()
			if err != nil {
				err := service.DeleteCovers(uploaded)
				return  uploaded, deleted, err
			}
			//store new cover to be inserted later
			uploaded = append(uploaded, key)
		
		}
		newCoversMap[key] = cover
	}

	// check if old covers are removed, if removed, delete from object storage
	for _, oldCover := range oldCoversMap {
		key := oldCover
		_, stillExist := newCoversMap[key]
		if !stillExist {
			err := service.storage.Delete(key, bucket)
			if err != nil {
				deleteErr := service.DeleteCovers(uploaded)
				if(deleteErr != nil){
					return uploaded, deleted, deleteErr
				}
				return uploaded, deleted, err
			}
			
		}

	}
	return uploaded, deleted, nil
}
func(service * BookCoverService)DeleteCoversByBook(id string)error{
	path := fmt.Sprintf("covers/%s/", id)
	bucket := service.config.AWS.DefaultBucket
	objects, err  := service.storage.ListFiles(path, bucket)
	if err != nil {
		return err
	}
	for _, objectKey := range objects {
		err := service.storage.Delete(objectKey, bucket)
		if err != nil { return err}
	}
	return nil
}