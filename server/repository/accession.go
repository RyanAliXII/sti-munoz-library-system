package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/jmoiron/sqlx"
)

type AccessionRepository interface {
	GetAccessions(filter filter.Filter) []model.Accession
	GetAccessionsByBookIdDontIgnoreWeeded(id string) []model.Accession 
	GetAccessionsByBookId(id string) []model.Accession 
	WeedAccession(id string, remarks string) error
	Recirculate(id string) error
	SearchAccession(filter filter.Filter) []model.Accession
	MarkAsMissing(id string, remarks string) error
	GetAccessionsById(id string) (model.Accession, error)
	UpdateAccession(accession model.Accession) error
	GetAccessionByCollection(collectionId int ) ([]model.Accession, error) 
	UpdateBulkByCollectionId(accessions []model.Accession, collectionId int) error 
	Delete(id string) error
}
type Accession struct {
	db *sqlx.DB
}

func (repo *Accession) GetAccessions(filter filter.Filter) []model.Accession {
	var accessions []model.Accession = make([]model.Accession, 0)
	query := `
	SELECT accession.id, accession.number, copy_number, book.json_format as book,
	accession.book_id,
	(CASE WHEN bb.accession_id is not null then false else true END)as is_checked_out,
	(CASE WHEN bb.accession_id is not null then false else true END) as is_available
	FROM catalog.accession
	INNER JOIN book_view as book on accession.book_id = book.id 
	LEFT JOIN borrowing.borrowed_book
	as bb on accession.id = bb.accession_id AND (status_id = 1 OR status_id = 2 OR status_id = 3)
	where weeded_at is null
	ORDER BY book.created_at DESC
	LIMIT $1 OFFSET $2
	`
	selectAccessionErr := repo.db.Select(&accessions, query, filter.Limit, filter.Offset)
	if selectAccessionErr != nil {
		logger.Error(selectAccessionErr.Error(), applog.Function("BookRepository.GetAccessions"), applog.Error("selectAccessionErr"))
		return accessions
	}
	return accessions
}
func (repo *Accession) SearchAccession(filter filter.Filter) []model.Accession {
	var accessions []model.Accession = make([]model.Accession, 0)
	query := `
	SELECT accession.id, accession.number, copy_number, book.json_format as book,
	accession.book_id,
	(CASE WHEN bb.accession_id is not null then false else true END)as is_checked_out,
	(CASE WHEN bb.accession_id is not null then false else true END) as is_available
	FROM catalog.accession
	INNER JOIN book_view as book on accession.book_id = book.id 
	LEFT JOIN borrowing.borrowed_book
	as bb on accession.id = bb.accession_id AND (status_id = 1 OR status_id = 2 OR status_id = 3) 
	where (
		search_vector @@ websearch_to_tsquery('english', $1) 
		OR search_vector @@ plainto_tsquery('simple', $1)
		OR search_tag_vector @@ websearch_to_tsquery('english', $1) 
		OR search_tag_vector @@ plainto_tsquery('simple', $1)
		OR CAST(accession.number as TEXT) LIKE '%' || $1 || '%'
	)
	ORDER BY book.created_at DESC
	LIMIT $2 OFFSET $3
	`
	selectAccessionErr := repo.db.Select(&accessions, query, filter.Keyword, filter.Limit, filter.Offset)
	if selectAccessionErr != nil {
		logger.Error(selectAccessionErr.Error(), applog.Function("BookRepository.SearchAccessions"), applog.Error("searchAccessionErr"))
		return accessions
	}
	return accessions
}
func (repo *Accession) GetAccessionsByBookIdDontIgnoreWeeded(id string) []model.Accession {
	var accessions []model.Accession = make([]model.Accession, 0)
	query := `
	SELECT accession.id, accession.number, copy_number, book.json_format as book,
	accession.book_id,
	accession.remarks,
	(CASE WHEN accession.weeded_at is null then false else true END) as is_weeded,
	(CASE WHEN accession.missing_at is null then false else true END) as is_missing,
	(CASE WHEN bb.accession_id is not null then false else true END)as is_checked_out,
	(CASE WHEN bb.accession_id is not null then false else true END) as is_available
	FROM catalog.accession
	INNER JOIN book_view as book on accession.book_id = book.id 
	LEFT JOIN borrowing.borrowed_book
	as bb on accession.id = bb.accession_id AND (status_id = 1 OR status_id = 2 OR status_id = 3 OR status_id = 6) 
	where book_id =  $1 AND deleted_at is null
	ORDER BY copy_number ASC
	`
	selectAccessionErr := repo.db.Select(&accessions, query, id)
	if selectAccessionErr != nil {
		logger.Error(selectAccessionErr.Error(), applog.Function("BookRepository.GetAccessionsByBookIdDontIgnoreWeeded"), applog.Error("selectAccessionErr"))
		return accessions
	}
	return accessions
}

func (repo *Accession)WeedAccession(id string, remarks string) error{
	_,err := repo.db.Exec("UPDATE catalog.accession SET weeded_at = NOW(), remarks = $1 where id = $2", remarks, id)
	 return err
  }
  func (repo *Accession)MarkAsMissing(id string, remarks string) error{
	_,err := repo.db.Exec("UPDATE catalog.accession SET missing_at = NOW(), remarks = $1 where id = $2", remarks, id)
	 return err
  }
  func (repo *Accession)Recirculate(id string) error{
	  _,err := repo.db.Exec("UPDATE catalog.accession SET weeded_at = null,  missing_at = null, remarks = '' where id = $1", id)
	   return err
  }
  func (repo *Accession) GetAccessionsByBookId(id string) []model.Accession {
	  var accessions []model.Accession = make([]model.Accession, 0)
	  query := `
	  SELECT accession.id, accession.number, copy_number, book.json_format as book,
	  accession.book_id,
	  (CASE WHEN bb.accession_id is not null then true else false END)as is_checked_out,
	  (CASE WHEN bb.accession_id is not null then false else true END) as is_available
	  FROM catalog.accession
	  as accession 
	  INNER JOIN book_view as book on accession.book_id = book.id 
	  LEFT JOIN borrowing.borrowed_book
	  as bb on accession.id = bb.accession_id AND (status_id = 1 OR status_id = 2 OR status_id = 3) 
	  WHERE book.id = $1 and weeded_at is null and missing_at is null and deleted_at is null
	  ORDER BY copy_number
	  `
	  selectAccessionErr := repo.db.Select(&accessions, query, id)
	  if selectAccessionErr != nil {
		  logger.Error(selectAccessionErr.Error(), applog.Function("BookRepository.GetAccessionByBookId"), applog.Error("selectAccessionErr"))
		  return accessions
	  }
	  return accessions
}

func (repo *Accession) GetAccessionsById(id string) (model.Accession, error) {
	accession :=model.Accession{}
	query := `
	SELECT accession.id, accession.number, copy_number, book.json_format as book,
	accession.book_id,
	(CASE WHEN bb.accession_id is not null then true else false END)as is_checked_out,
	(CASE WHEN bb.accession_id is not null then false else true END) as is_available
	FROM catalog.accession
	as accession 
	INNER JOIN book_view as book on accession.book_id = book.id 
	LEFT JOIN borrowing.borrowed_book
	as bb on accession.id = bb.accession_id AND (status_id = 1 OR status_id = 2 OR status_id = 3) 
	WHERE accession.id = $1 and weeded_at is null and missing_at is null
	ORDER BY copy_number
	LIMIT 1
	`
	err := repo.db.Get(&accession, query, id)
	return accession, err
}

func (repo * Accession) GetAccessionByCollection(collectionId int ) ([]model.Accession, error) {
	accessions := make([]model.Accession, 0)
	query := `
	SELECT accession.id, accession.number, copy_number, book.json_format as book,
	accession.book_id,
	(CASE WHEN bb.accession_id is not null then true else false END)as is_checked_out,
	(CASE WHEN bb.accession_id is not null then false else true END) as is_available
	FROM catalog.accession
	as accession 
	INNER JOIN book_view as book on accession.book_id = book.id 
	LEFT JOIN borrowing.borrowed_book
	as bb on accession.id = bb.accession_id AND (status_id = 1 OR status_id = 2 OR status_id = 3) 
	WHERE book.section_id = $1
	ORDER BY accession.number ASC
	`
	err := repo.db.Select(&accessions, query,  collectionId)
	return accessions, err
}
func (repo * Accession)UpdateAccession(accession model.Accession) error {
	_, err := repo.db.Exec("Update catalog.accession set number = $1 where id = $2", accession.Number, accession.Id)
	return err
}
func (repo * Accession)UpdateBulkByCollectionId(accessions []model.Accession, collectionId int) error {

	dialect := goqu.Dialect("postgres")
	ds := dialect.Update(goqu.T("accession").Schema("catalog")).Prepared(true)
	ids := make([]string, 0)
	caseStmt := goqu.Case()
	for _, accession := range accessions {
		caseStmt = caseStmt.When(goqu.C("id").Eq(accession.Id), accession.Number)
		ids = append(ids, accession.Id)
	}
	caseStmt = caseStmt.Else(goqu.C("number").Schema("accession"))
	ds = ds.Set(goqu.Record{
		"number": caseStmt,
	})
	ds = ds.Where(exp.Ex{
		"id" : ids,
	})
	query, args, err := ds.ToSQL()
	if err != nil {
		return err
	}
	_, err = repo.db.Exec(query, args...)
	if err != nil {
		return err
	}
	return nil
}
func(repo * Accession)Delete(id string) error {
	accession, err := repo.GetAccessionsById(id)
	if err != nil {
		return err
	}
	accessions := repo.GetAccessionsByBookIdDontIgnoreWeeded(accession.BookId)
	//if there is only one copy of book, mark the whole book as deleted.
	if(len(accessions) == 1) {
		_, err = repo.db.Exec("UPDATE catalog.book set deleted_at = now() where id = $1" , accession.BookId)
		return  err
	}
	_, err = repo.db.Exec("UPDATE catalog.accession set deleted_at = now() where id = $1", id)
	return err
}
func NewAccessionRepository (db * sqlx.DB) AccessionRepository{
	return &Accession{
		db: db,
	}
}