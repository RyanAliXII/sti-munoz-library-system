package repository


func (repo *Book)GetEbookById(id string) (string, error) {
	ebookKey := ""
	err := repo.db.Get(&ebookKey, "SELECT ebook from book_view where id = $1", id)
	return ebookKey, err
}
func (repo *Book)RemoveEbookById(id string) error{
	_, err := repo.db.Exec("Update catalog.book set ebook = '' where id  = $1", id)
   return err
}
func (repo *Book)UpdateEbookByBookId(id string,  objectKey string) error{
	_, err := repo.db.Exec("Update catalog.book set ebook = $1 where id = $2", objectKey, id)
	return err
}