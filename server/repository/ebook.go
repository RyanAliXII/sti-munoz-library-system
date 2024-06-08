package repository

import (
	"io"
	"os"
)


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
		return err
	}
	_, err = repo.db.Exec("Update catalog.book set ebook = '' where id  = $1", id)
	if err != nil {
		 return err
	}

   return nil
}

func (repo *Book)UpdateEbookByBookId(id string,  objectKey string) error{
	_, err := repo.db.Exec("Update catalog.book set ebook = $1 where id = $2", objectKey, id)
	if err != nil {
		return err
	}
	return nil
}