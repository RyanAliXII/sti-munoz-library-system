package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type InventoryRepository struct {
	db *sqlx.DB
}

func (repo *InventoryRepository) GetAudit() []model.Audit {
	query := "SELECT id, name FROM inventory.audit ORDER BY created_at DESC"
	var audit []model.Audit = make([]model.Audit, 0)

	selectErr := repo.db.Select(&audit, query)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("InventoryRepository.GetAudit"), slimlog.Error("selectErr"))
	}
	return audit
}
func (repo *InventoryRepository) GetById(id string) model.Audit {

	query := "SELECT id, name FROM inventory.audit where id = $1"
	var audit model.Audit = model.Audit{}

	selectErr := repo.db.Get(&audit, query, id)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("InventoryRepository.GetAudit"), slimlog.Error("selectErr"))
	}
	return audit
}

func (repo *InventoryRepository) GetAuditedAccessionById(id string) []model.AuditedBook {

	var audited []model.AuditedBook
	query := `
	SELECT book.id,title, isbn, 
	description, 
	copies,
	pages,
	cost_price,
	edition,
	year_published,
	received_at,
	ddc,
	fund_source,
	publisher,
	authors
	author_number,
	book.created_at,
	covers,
	COALESCE(json_agg(json_build_object('id',accession.id,'number', accession.number, 'copyNumber', accession.copy_number, 
	'isAudited',(case when aa.audit_id is null then false else true end), 'isCheckedOut', (case when bb.transaction_id is null then false else true end))),'[]') as accessions
	FROM inventory.audited_book  
	INNER JOIN book_view as book on audited_book.book_id = book.id
	INNER JOIN get_accession_table() as accession on book.id = accession.book_id 

	LEFT JOIN inventory.audited_accession as aa on accession.id = aa.accession_id AND audited_book.audit_id = aa.audit_id 
	LEFT JOIN circulation.borrowed_book as bb on accession.book_id = bb.book_id AND  accession.number =  bb. accession_number AND bb.returned_at is null
	where audited_book.audit_id = $1
	GROUP BY audited_book.audit_id, audited_book.book_id, book.id, title, isbn, 
	description, 
	copies,
	pages,
	cost_price,
	edition,
	year_published,
	received_at,
	ddc,
	author_number,
	book.created_at,
	fund_source,
	publisher,
	authors,
	covers
	ORDER BY book.created_at DESC
	`
	selectErr := repo.db.Select(&audited, query, id)
	if selectErr != nil {
		logger.Info(selectErr.Error(), slimlog.Function("InventoryRepository.GetAuditedAccessionById"), slimlog.Error("selectErr"))
	}
	return audited
}
func (repo *InventoryRepository) AddToAudit(auditId string, accessionId string) error {
	const UNIQUE_VIOLATION_ERROR = "unique_violation"
	transaction, transactErr := repo.db.Beginx()
	if transactErr != nil {
		logger.Error(transactErr.Error(), slimlog.Function("InventoryRepository.AddToAudit"), slimlog.Error("transactErr"))
		transaction.Rollback()
		return transactErr
	}

	//get the book of scanned accession
	query := "Select book_id from get_accession_table() where id = $1 LIMIT 1"

	accession := model.Accession{}
	
	 getErr := transaction.Get(&accession, query, accessionId)
	if(getErr != nil ){
		logger.Error(getErr.Error(), slimlog.Function("InventoryRepository.AddToAudit"), slimlog.Error("getErr"))
		transaction.Rollback()
		return getErr
	}
	// check if book is already audited
	query = `SELECT EXISTS(SELECT 1 FROM inventory.	audited_book where audit_id = $1  AND book_id = $2 )`
	exists := true
	checkBookisAuditedErr := transaction.Get(&exists, query, auditId, accession.BookId)

	if checkBookisAuditedErr != nil{
		logger.Error(checkBookisAuditedErr.Error(), slimlog.Function("InventoryRepository.AddToAudit"), slimlog.Error("checkBookisAuditedErr"))
		transaction.Rollback()
		return checkBookisAuditedErr
	}
	// insert the book to audited book if not exist
	if !exists{
		query = `INSERT INTO inventory.audited_book(book_id, audit_id) VALUES ($1,$2)`
		_, auditBookErr := transaction.Exec(query, accession.BookId, auditId)
		if auditBookErr != nil {
			logger.Error(auditBookErr.Error(), slimlog.Function("InventoryRepository.AddToAudit"), slimlog.Error("insertAuditedBookErr"))
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
			logger.Error(insertAccessionToAuditErr.Error(), slimlog.Function("InventoryRepository.AddToAudit"), slimlog.Error("insertAccessionToAuditErr"))
			transaction.Rollback()
			return insertAccessionToAuditErr
		}

		if err.Code.Name() != UNIQUE_VIOLATION_ERROR {
	
			logger.Error(insertAccessionToAuditErr.Error(), slimlog.Function("InventoryRepository.AddToAudit"), slimlog.Error("insertAccessionToAuditErr"))
			transaction.Rollback()
			return insertAccessionToAuditErr
		}
		//if already inserted
		logger.Info("Accession Already scanned.", slimlog.Function("InventoryRepository.AddToAudit"))
		transaction.Rollback()
		return nil
	}
	transaction.Commit()
	return nil
}
func (repo *InventoryRepository) NewAudit(audit model.Audit) error {
	_, insertErr := repo.db.NamedExec("INSERT INTO inventory.audit(name)VALUES(:name)", audit)
	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function("InventoryRepository.NewAudit"), slimlog.Error("insertErr"))
	}
	return insertErr
}
func (repo *InventoryRepository) UpdateAudit(audit model.Audit) error {
	_, updateErr := repo.db.Exec("UPDATE inventory.audit SET name = $1 WHERE id = $2", audit.Name, audit.Id)
	if updateErr != nil {
		logger.Error(updateErr.Error(), slimlog.Function("InventoryRepository.UpdateAudit"), slimlog.Error("updateErr"))
	}
	return updateErr
}
func NewInventoryRepository() InventoryRepositoryInterface {
	return &InventoryRepository{
		db: postgresdb.GetOrCreateInstance(),
	}

}

type InventoryRepositoryInterface interface {
	GetAudit() []model.Audit
	GetById(id string) model.Audit
	GetAuditedAccessionById(id string) []model.AuditedBook
	AddToAudit(id string,  accessionId string) error
	NewAudit(audit model.Audit) error
	UpdateAudit(audit model.Audit) error
}
