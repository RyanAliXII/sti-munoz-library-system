package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type Inventory struct {
	db *sqlx.DB
}

func (repo *Inventory) GetAudit() []model.Audit {
	query := "SELECT id, name FROM inventory.audit ORDER BY created_at DESC"
	var audit []model.Audit = make([]model.Audit, 0)

	selectErr := repo.db.Select(&audit, query)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("Inventory.GetAudit"), slimlog.Error("selectErr"))
	}
	return audit
}
func (repo *Inventory) GetById(id string) model.Audit {

	query := "SELECT id, name FROM inventory.audit where id = $1"
	var audit model.Audit = model.Audit{}

	selectErr := repo.db.Get(&audit, query, id)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("Inventory.GetAudit"), slimlog.Error("selectErr"))
	}
	return audit
}

func (repo *Inventory) GetAuditedAccessionById(id string) ([]model.AuditedBook, error) {

	var audited []model.AuditedBook
	query := `
	SELECT book.id, title, 
	COALESCE(json_agg(json_build_object('id',accession.id,'number', accession.number, 'copyNumber', accession.copy_number, 
	'isAudited',(case when aa.audit_id is null then false else true end), 'isCheckedOut', (case when bb.id is null  then false else true end))),'[]') as accessions
	FROM inventory.audited_book
	INNER JOIN book_view as book on audited_book.book_id = book.id
	INNER JOIN catalog.accession as accession on book.id = accession.book_id and accession.weeded_at is null
	LEFT JOIN inventory.audited_accession as aa on accession.id = aa.accession_id  
	LEFT JOIN borrowing.borrowed_book as bb on accession.id = bb.accession_id AND bb.status_id = 3
	where audited_book.audit_id = $1
	GROUP BY audited_book.audit_id, audited_book.book_id, book.id, title, book.created_at 
	ORDER BY book.created_at DESC
	`
	selectErr := repo.db.Select(&audited, query, id)
	if selectErr != nil {
		return audited, selectErr
	}
	return audited, nil
}
func (repo *Inventory) AddToAudit(auditId string, accessionId string) error {
	const UNIQUE_VIOLATION_ERROR = "unique_violation"
	transaction, transactErr := repo.db.Beginx()
	if transactErr != nil {
		logger.Error(transactErr.Error(), slimlog.Function("Inventory.AddToAudit"), slimlog.Error("transactErr"))
		transaction.Rollback()
		return transactErr
	}

	//get the book of scanned accession
	query := "Select book_id from catalog.accession where id = $1 LIMIT 1"

	accession := model.Accession{}
	
	 getErr := transaction.Get(&accession, query, accessionId)
	if(getErr != nil ){
		logger.Error(getErr.Error(), slimlog.Function("Inventory.AddToAudit"), slimlog.Error("getErr"))
		transaction.Rollback()
		return getErr
	}
	// check if book is already audited
	query = `SELECT EXISTS(SELECT 1 FROM inventory.audited_book where audit_id = $1  AND book_id = $2 )`
	exists := true
	checkBookisAuditedErr := transaction.Get(&exists, query, auditId, accession.BookId)

	if checkBookisAuditedErr != nil{
		logger.Error(checkBookisAuditedErr.Error(), slimlog.Function("Inventory.AddToAudit"), slimlog.Error("checkBookisAuditedErr"))
		transaction.Rollback()
		return checkBookisAuditedErr
	}
	// insert the book to audited book if not exist
	if !exists{
		query = `INSERT INTO inventory.audited_book(book_id, audit_id) VALUES ($1,$2)`
		_, auditBookErr := transaction.Exec(query, accession.BookId, auditId)
		if auditBookErr != nil {
			logger.Error(auditBookErr.Error(), slimlog.Function("Inventory.AddToAudit"), slimlog.Error("insertAuditedBookErr"))
			transaction.Rollback()
			return auditBookErr
		}
	}
	//insert book accessioss to audited accession
	insertAccessionToAudit := `INSERT INTO inventory.audited_accession(audit_id, accession_id) VALUES ($1,$2)`
	_, insertAccessionToAuditErr := transaction.Exec(insertAccessionToAudit,auditId,accessionId)

	if insertAccessionToAuditErr != nil {
		err, ok := insertAccessionToAuditErr.(*pq.Error)
		if !ok {
			logger.Error(insertAccessionToAuditErr.Error(), slimlog.Function("Inventory.AddToAudit"), slimlog.Error("insertAccessionToAuditErr"))
			transaction.Rollback()
			return insertAccessionToAuditErr
		}

		if err.Code.Name() != UNIQUE_VIOLATION_ERROR {
			
			logger.Error(insertAccessionToAuditErr.Error(), slimlog.Function("Inventory.AddToAudit"), slimlog.Error("insertAccessionToAuditErr"))
			transaction.Rollback()
			return insertAccessionToAuditErr
		}
		//if already inserted
		logger.Info("Accession Already scanned.", slimlog.Function("Inventory.AddToAudit"))
		transaction.Rollback()
		return nil
	}
	transaction.Commit()
	return nil
}
func (repo *Inventory) AddBookToAudit(auditId string, bookId string) error {
	query := `SELECT EXISTS(SELECT 1 FROM inventory.	audited_book where audit_id = $1  AND book_id = $2 )`
	exists := true
	checkBookisAuditedErr := repo.db.Get(&exists, query, auditId, bookId)

	if checkBookisAuditedErr != nil{
		logger.Error(checkBookisAuditedErr.Error(), slimlog.Function("Inventory.AddBookToAudit"), slimlog.Error("checkBookisAuditedErr"))

		return checkBookisAuditedErr
	}
	// insert the book to audited book if not exist
	if !exists{
		query = `INSERT INTO inventory.audited_book(book_id, audit_id) VALUES ($1,$2)`
		_, auditBookErr := repo.db.Exec(query, bookId, auditId)
		if auditBookErr != nil {
			logger.Error(auditBookErr.Error(), slimlog.Function("Inventory.AddBookToAudit"), slimlog.Error("insertAuditedBookErr"))
			
			return auditBookErr
		}
	}

	return nil
}
func (repo *Inventory)GetMissingBooksByAuditId(auditId string)([]model.AuditedAccession, error) {
	audited := make([]model.AuditedAccession, 0)
	query := `
		WITH accession as (
			SELECT accession.id, title, book.id as book_id, accession.number, accession.copy_number FROM catalog.accession 
			INNER JOIN book_view as book on accession.book_id = book.id
		)
		SELECT title, ab.audit_id, ab.book_id, accession.number, accession.copy_number, 
		(case when aa.audit_id is null then false else true end) as is_audited,
		(case when bb.id is null  then false else true end) as is_checked_out
		FROM inventory.audited_book as ab
		INNER JOIN accession on ab.book_id = accession.book_id
		LEFT JOIN inventory.audited_accession as aa on accession.id = aa.accession_id
		LEFT JOIN borrowing.borrowed_book as bb on accession.id = bb.accession_id AND bb.status_id = 3
		where aa.audit_id is null and  ab.audit_id = $1  
	`
	err := repo.db.Select(&audited, query, auditId)
	return audited, err
}
func (repo * Inventory)GetFoundBooksByAuditId(auditId string)([]model.AuditedAccession, error){
	audited := make([]model.AuditedAccession, 0)
	query := `
		WITH accession as (
			SELECT accession.id, title, book.id as book_id, accession.number, accession.copy_number FROM catalog.accession 
			INNER JOIN book_view as book on accession.book_id = book.id
		)
		SELECT title, ab.audit_id, ab.book_id, accession.number, accession.copy_number, 
		(case when aa.audit_id is null then false else true end) as is_audited,
		(case when bb.id is null  then false else true end) as is_checked_out
		FROM inventory.audited_book as ab
		INNER JOIN accession on ab.book_id = accession.book_id
		LEFT JOIN inventory.audited_accession as aa on accession.id = aa.accession_id
		LEFT JOIN borrowing.borrowed_book as bb on accession.id = bb.accession_id AND bb.status_id = 3
		where aa.audit_id is not null and ab.audit_id = $1
	`
	err := repo.db.Select(&audited, query, auditId)
	return audited, err
}

func (repo *Inventory) DeleteBookCopyFromAudit(auditId string, accessionId string) error {
	
		query := `DELETE FROM inventory.audited_accession where audit_id = $1 and accession_id = $2`
		_, deleteErr := repo.db.Exec(query, auditId, accessionId)
		if deleteErr != nil {
			logger.Error(deleteErr.Error(), slimlog.Function("Inventory.AddToAudit"), slimlog.Error("deleteAuditErr"))
			return deleteErr
		}
	
	return deleteErr
}

func (repo *Inventory) NewAudit(audit model.Audit) error {
	_, insertErr := repo.db.NamedExec("INSERT INTO inventory.audit(name)VALUES(:name)", audit)
	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function("Inventory.NewAudit"), slimlog.Error("insertErr"))
	}
	return insertErr
}
func (repo *Inventory) UpdateAudit(audit model.Audit) error {
	_, updateErr := repo.db.Exec("UPDATE inventory.audit SET name = $1 WHERE id = $2", audit.Name, audit.Id)
	if updateErr != nil {
		logger.Error(updateErr.Error(), slimlog.Function("Inventory.UpdateAudit"), slimlog.Error("updateErr"))
	}
	return updateErr
}
func NewInventoryRepository(db *sqlx.DB) InventoryRepository{
	return &Inventory{
		db: db,
	}

}

type InventoryRepository interface {
	GetAudit() []model.Audit
	GetById(id string) model.Audit
	GetAuditedAccessionById(id string) ([]model.AuditedBook, error)
	AddToAudit(id string,  accessionId string) error
	NewAudit(audit model.Audit) error
	UpdateAudit(audit model.Audit) error
	AddBookToAudit(auditId string, bookId string) error
	DeleteBookCopyFromAudit(auditId string, accessionId string) error
	GetMissingBooksByAuditId(auditId string)([]model.AuditedAccession, error)
	GetFoundBooksByAuditId(auditId string)([]model.AuditedAccession, error)
}
