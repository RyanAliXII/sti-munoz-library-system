package repository

import (
	"github.com/doug-martin/goqu/v9"
)
func (repo *Book) NewCovers(bookId string, keys []string) error {
	dialect := goqu.Dialect("postgres")
	bookCoverRows := make([]goqu.Record, 0)
	for _, key := range keys {
		bookCoverRows = append(bookCoverRows, goqu.Record{
			"path":    key,
			"book_id": bookId,
		})
	}
	ds := dialect.From(goqu.T("book_cover").Schema("catalog")).Prepared(true).Insert().Rows(bookCoverRows)
	query, args, _ := ds.ToSQL()
	_, err := repo.db.Exec(query, args...)
	if err != nil {
		return err
	}
	return nil
}
func (repo *Book) UpdateCovers(bookId string, uploadedCovers []string, deletedCovers []string) error {
	dialect := goqu.Dialect("postgres")
	bookCoverRows := make([]goqu.Record, 0)

	//prepare newly inserted covers
	for _, key := range uploadedCovers {
		bookCoverRows = append(bookCoverRows, goqu.Record{
			"path":   key,
			"book_id": bookId,
		})
	}
	transaction, err := repo.db.Beginx()

	if err != nil {
		transaction.Rollback()
		return err
	}
	// delete covers from db
	for _, key := range  deletedCovers {

		_, err := transaction.Exec("Delete from catalog.book_cover where book_id= $1 AND path = $2  ", bookId, key)
		if err != nil {
			transaction.Rollback()
			return err
		}
	}
	// insert new uploaded cover to db.
	insertDs := dialect.From(goqu.T("book_cover").Schema("catalog")).Prepared(true).Insert().Rows(bookCoverRows)
	query, args, _ := insertDs.ToSQL()
	_, err = transaction.Exec(query, args...)
	if err != nil {
		transaction.Rollback()
		return err
	}
	transaction.Commit()
	return nil
}
func (repo *Book) DeleteBookCoversByBookId(bookId string) error {
	_, err := repo.db.Exec("DELETE FROM catalog.book_cover where book_id = $1", bookId)
	if err != nil {
		return err
	}
	return nil
}