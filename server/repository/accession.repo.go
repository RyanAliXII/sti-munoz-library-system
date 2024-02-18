package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
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
		logger.Error(selectAccessionErr.Error(), slimlog.Function("BookRepository.GetAccessions"), slimlog.Error("selectAccessionErr"))
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
		logger.Error(selectAccessionErr.Error(), slimlog.Function("BookRepository.SearchAccessions"), slimlog.Error("searchAccessionErr"))
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
	where book_id =  $1
	ORDER BY copy_number ASC
	`
	selectAccessionErr := repo.db.Select(&accessions, query, id)
	if selectAccessionErr != nil {
		logger.Error(selectAccessionErr.Error(), slimlog.Function("BookRepository.GetAccessionsByBookIdDontIgnoreWeeded"), slimlog.Error("selectAccessionErr"))
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
	  WHERE book.id = $1 and weeded_at is null and missing_at is null
	  ORDER BY copy_number
	  `
	  selectAccessionErr := repo.db.Select(&accessions, query, id)
	  if selectAccessionErr != nil {
		  logger.Error(selectAccessionErr.Error(), slimlog.Function("BookRepository.GetAccessionByBookId"), slimlog.Error("selectAccessionErr"))
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
func NewAccessionRepository () AccessionRepository{
	return &Accession{
		db: db.Connect(),
	}
}