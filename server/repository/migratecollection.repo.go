package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
)


func (repo * BookRepository)MigrateCollection(sectionId int, bookIds []string)error{
	if len(bookIds) == 0 {
		return nil
	}
	count := 0
    dialect := goqu.Dialect("postgres")
	collection := model.Section{}
	err := repo.db.Get(&collection, "SELECT id, accession_table from catalog.section where id = $1 LIMIT 1", sectionId)
	if err != nil {
		return err
	}
	//get first book in the list
	book := repo.GetOne(bookIds[0])
	ds := dialect.Select(goqu.COUNT(goqu.I("id"))).Prepared(true).From("book_view").Where(exp.Ex{"id": bookIds, "accession_table": book.AccessionTable})
	query, args, err := ds.ToSQL()
	if err != nil {
		return err
	}

	err = repo.db.Get(&count, query, args...)
	if err != nil {
		return err
	}
	if count != len(bookIds) {
		return fmt.Errorf("book section are not all the same")
	}
	updateDs := dialect.Update(goqu.T("book").Schema("catalog")).Prepared(true)
    if(collection.AccessionTable != book.AccessionTable){
		transaction, err := repo.db.Beginx()
		if err != nil {
			transaction.Rollback()
			return err
		}
		updateDs = updateDs.Set(goqu.Record{
			"section_id" : collection.Id,
		}).Where(goqu.Ex{"id": bookIds})
		query, args ,err = updateDs.ToSQL()
		if err != nil {
			transaction.Rollback()
			return err
		}
		_, err = transaction.Exec(query, args...)
	
		if err != nil {
			transaction.Rollback()
			return err
		}
		
		updateDs := dialect.Update(goqu.T("accession").Schema("catalog")).Set(goqu.Record{
			"number": goqu.L(fmt.Sprintf("get_next_id('%s')", collection.AccessionTable)),
		}).Where(goqu.Ex{"book_id": bookIds})

		query, args ,err = updateDs.ToSQL()
		if err != nil {
			transaction.Rollback()
			return err
		}
		_, err = transaction.Exec(query, args...)
		
		if err != nil {
			transaction.Rollback()
			return err
		}
		transaction.Commit()
		return nil
	}
	updateDs = updateDs.Set(goqu.Record{
		"section_id" : collection.Id,
	}).Where(goqu.Ex{"id": bookIds})

	query, args ,err = updateDs.ToSQL()
	if err != nil {
		return err
	}
	_, err = repo.db.Exec(query, args...)
	if err != nil {
		return err
	}
	return nil
}