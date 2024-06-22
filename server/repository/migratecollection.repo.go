package repository

import (
	"github.com/doug-martin/goqu/v9"
)


func (repo *Book)MigrateCollection(sectionId int, bookIds []string)error{
	if len(bookIds) == 0 {
		return nil
	}
	dialect := goqu.Dialect("postgres")
	ds := dialect.Update(goqu.T("book").Schema("catalog")).Set(goqu.Record{
		"section_id": sectionId,
	}).Where(goqu.C("id").In(bookIds)).Prepared(true)
	sql, args, err := ds.ToSQL()
	if err != nil {
		return err
	}
	_, err = repo.db.Exec(sql, args...)
	if err != nil {
		return err
	}
	return nil
}