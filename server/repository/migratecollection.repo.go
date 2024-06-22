package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
)


func (repo *Book)MigrateCollection(sectionId int, bookIds []string)error{
	if len(bookIds) == 0 {
		return nil
	}
    dialect := goqu.Dialect("postgres")
	collection := model.Section{}
	err := repo.db.Get(&collection, "SELECT id, accession_table from catalog.section where id = $1 LIMIT 1", sectionId)
	if err != nil {
		return err
	}
	ds := dialect.Select(goqu.C("accession_table"), goqu.C("id")).Prepared(true).From("book_view").Where(exp.Ex{"id": bookIds})
	query, args, err := ds.ToSQL()
	if err != nil {
		return err
	}
	books := make([]model.Book, 0)

	err = repo.db.Select(&books, query, args...)
	if err != nil {
		return err
	}
	transaction, err := repo.db.Beginx()
	if err != nil {
		return err
	}
	// for _, book := range books{
	// 	_, err := transaction.Exec("UPDATE catalog.book SET section_id = $1 where id = $2", collection.Id, book.Id)
	// 	if err != nil {
	// 		transaction.Rollback()
	// 		return err
	// 	}
	// 	if(book.AccessionTable != collection.AccessionTable){
	// 		query := fmt.Sprintf("UPDATE catalog.accession SET number = get_next_id('%s'), section_id = $1  where book_id = $2", collection.AccessionTable)
	// 		_, err := transaction.Exec(query, collection.Id, book.Id)
	// 		if err != nil {
	// 			transaction.Rollback()
	// 			return err
	// 		}
	// 	}else{
	// 		query := "UPDATE catalog.accession SET section_id = $1 where book_id = $2"
	// 		_, err := transaction.Exec(query, collection.Id, book.Id)
	// 		if err != nil {
	// 			transaction.Rollback()
	// 			return err
	// 		}
	// 	}
	// }
	transaction.Commit()
	return nil
}