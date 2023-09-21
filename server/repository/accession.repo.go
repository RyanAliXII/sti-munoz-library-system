package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jmoiron/sqlx"
)

type AccessionRepository interface {
	GetAccessions() []model.Accession
	GetAccessionsByBookIdDontIgnoreWeeded(id string) []model.Accession 
	GetAccessionsByBookId(id string) []model.Accession 
	WeedAccession(id string, remarks string) error
	Recirculate(id string) error
}
type Accession struct {
	db *sqlx.DB
}

func (repo *Accession) GetAccessions() []model.Accession {
	var accessions []model.Accession = make([]model.Accession, 0)

	query := `
	SELECT accession.id, accession.number, copy_number, book.json_format as book,
	accession.book_id,
	(CASE WHEN bb.accession_id is not null then false else true END)as is_checked_out,
	(CASE WHEN bb.accession_id is not null then false else true END) as is_available
	FROM catalog.accession
	INNER JOIN book_view as book on accession.book_id = book.id 
	LEFT JOIN borrowing.borrowed_book
	as bb on accession.id = bb.accession_id AND (status_id = 1 OR status_id = 2 OR status_id = 3 OR status_id = 6) 
	where weeded_at is null
	ORDER BY book.created_at DESC
	`
	selectAccessionErr := repo.db.Select(&accessions, query)
	if selectAccessionErr != nil {
		logger.Error(selectAccessionErr.Error(), slimlog.Function("BookRepository.GetAccessions"), slimlog.Error("selectAccessionErr"))
		return accessions
	}
	return accessions
}
func (repo *Accession) GetAccessionsByBookIdDontIgnoreWeeded(id string) []model.Accession {
	var accessions []model.Accession = make([]model.Accession, 0)
	query := `
	SELECT accession.id, accession.number, copy_number, book.json_format as book,
	accession.book_id,
	(CASE WHEN accession.weeded_at is null then false else true END) as is_weeded,
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
  func (repo *Accession)Recirculate(id string) error{
	  _,err := repo.db.Exec("UPDATE catalog.accession SET weeded_at = null, remarks = '' where id = $1", id)
	   return err
  }
  func (repo *Accession) GetAccessionsByBookId(id string) []model.Accession {
	  var accessions []model.Accession = make([]model.Accession, 0)
	  query := `
	  SELECT accession.id, accession.number, copy_number, book.json_format as book,
	  accession.book_id,
	  (CASE WHEN bb.accession_id is not null then false else true END)as is_checked_out,
	  (CASE WHEN bb.accession_id is not null then false else true END) as is_available
	  FROM catalog.accession
	  as accession 
	  INNER JOIN book_view as book on accession.book_id = book.id 
	  LEFT JOIN borrowing.borrowed_book
	  as bb on accession.id = bb.accession_id AND (status_id = 1 OR status_id = 2 OR status_id = 3 OR status_id = 6) 
	  WHERE book.id = $1 and weeded_at is null
	  ORDER BY copy_number
	  `
	  selectAccessionErr := repo.db.Select(&accessions, query, id)
	  if selectAccessionErr != nil {
		  logger.Error(selectAccessionErr.Error(), slimlog.Function("BookRepository.GetAccessionByBookId"), slimlog.Error("selectAccessionErr"))
		  return accessions
	  }
	  return accessions
}
func NewAccessionRepository () AccessionRepository{
	return &Accession{
		db: db.Connect(),
	}
}