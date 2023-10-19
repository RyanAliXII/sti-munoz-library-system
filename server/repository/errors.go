package repository

import "fmt"


type IsNotEbook struct {
	BookId string
}
func (err * IsNotEbook) Error() string{
	return fmt.Sprintf("book is not an ebook. book id = %s", err.BookId)
}