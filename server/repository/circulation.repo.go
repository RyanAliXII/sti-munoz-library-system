package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/status"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type CirculationRepository struct {
	db *sqlx.DB
	settingRepository  SettingsRepositoryInterface
}

func (repo *CirculationRepository) GetBorrowingTransactions() []model.BorrowingTransaction {
	var transactions []model.BorrowingTransaction = make([]model.BorrowingTransaction, 0)
	selectTransactionQuery := `
	SELECT bt.id,
	(case when bt.returned_at is null then false else true end) as is_returned,
	(case when now() > bt.returned_at then true else false end) as is_due,
	json_build_object('id',account.id, 'displayName', 
	display_name, 'email', email, 'givenName', account.given_name, 'surname', account.surname) as client,
	COALESCE(
		json_agg(json_build_object('number', 
		bb.accession_number,						   
		'bookId', bb.book_id,
		'copyNumber', accession.copy_number ,
		'returnedAt',bb.returned_at,
		'isReturned', (case when bb.returned_at is null then false else true end),	
		'book', book.json_format		   
	)),'[]') as borrowed_copies,
	bt.created_at, 
	COALESCE(bt.remarks, '') as remarks,
	bt.due_date, bt.returned_at
	from circulation.borrow_transaction as bt
	INNER JOIN system.account on bt.account_id = account.id
	INNER JOIN circulation.borrowed_book as bb on bt.id = bb.transaction_id
	INNER JOIN book_view as book on bb.book_id = book.id
	INNER JOIN get_accession_table() as accession on bb.accession_number = accession.number AND bb.book_id = accession.book_id
	GROUP BY bt.id, account.id
	ORDER by bt.created_at DESC
	`
	selectErr := repo.db.Select(&transactions, selectTransactionQuery)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("CirculationRepository.GetBorrowingTransactions"), slimlog.Error("SelectErr"))
	}

	return transactions
}
func (repo *CirculationRepository) GetBorrowingTransactionById(id string) model.BorrowingTransaction {
	var transaction model.BorrowingTransaction = model.BorrowingTransaction{}
	query := `SELECT bt.id,
	(case when bt.returned_at is null then false else true end) as is_returned,
	(case when now() > bt.returned_at then true else false end) as is_due,
	json_build_object('id',account.id, 'displayName', 
	display_name, 'email', email, 'givenName', account.given_name, 'surname', account.surname) as client,
	COALESCE(
		json_agg(json_build_object('number', 
		bb.accession_number,						   
		'bookId', bb.book_id,
		'copyNumber', accession.copy_number ,
		'returnedAt',bb.returned_at,
		'isReturned', (case when bb.returned_at is null then false else true end),	
		'book', book.json_format		   
	)),'[]') as borrowed_copies,
	bt.created_at, 
	COALESCE(bt.remarks, '') as remarks,
	bt.due_date, bt.returned_at
	from circulation.borrow_transaction as bt
	INNER JOIN system.account on bt.account_id = account.id
	INNER JOIN circulation.borrowed_book as bb on bt.id = bb.transaction_id
	INNER JOIN book_view as book on bb.book_id = book.id
	INNER JOIN get_accession_table() as accession on bb.accession_number = accession.number AND bb.book_id = accession.book_id
	Where bt.id = $1
	GROUP BY bt.id, account.id
	ORDER by bt.created_at DESC
	`
	getErrr := repo.db.Get(&transaction, query, id)
	if getErrr != nil {
		logger.Error(getErrr.Error(), slimlog.Function("CirculationRepository.GetBorrowingTransactionById"), slimlog.Error("getErr"))
	}
	return transaction
}
func (repo *CirculationRepository) NewTransaction(clientId string, dueDate db.NullableDate, accessions []model.Accession) error {
	settings := repo.settingRepository.Get()
	if settings.DuePenalty.Value == 0 {
		settingsErr := fmt.Errorf("due penalty value is 0")
		logger.Error(settingsErr.Error(), slimlog.Function("CirculationRepository.NewTransaction"), slimlog.Error("DuePenaltySettings"))
		return settingsErr
	}
	transactionId := uuid.NewString()
	transaction, transactErr := repo.db.Beginx()
	if transactErr != nil {
		transaction.Rollback()
		logger.Error(transactErr.Error(), slimlog.Function("CirculationRepository.NewTransaction"), slimlog.Error("transactErr"))
		return transactErr
	}
	query := `INSERT INTO circulation.borrow_transaction (id, account_id, due_date, penalty_on_past_due) VALUES($1,$2,$3,$4)`
	insertTransactionResult, insertTransactionErr := transaction.Exec(query, transactionId, clientId, dueDate, settings.DuePenalty.Value)

	if insertTransactionErr != nil {
		transaction.Rollback()
		logger.Error(insertTransactionErr.Error(), slimlog.Function("CirculationRepository.NewTransaction"), slimlog.Error("inserTransactionErr"))
		return insertTransactionErr
	}
	dialect := goqu.Dialect("postgres")
	var borrowedAccessionsRows []goqu.Record = make([]goqu.Record, 0)

	for _, accession := range accessions {
		borrowedAccessionsRows = append(borrowedAccessionsRows, goqu.Record{"transaction_id": transactionId, "accession_number": accession.Number, "book_id": accession.BookId})
	}
	accessionDs := dialect.From(goqu.T("borrowed_book").Schema("circulation")).Prepared(true).Insert().Rows(borrowedAccessionsRows)
	insertAccessionQuery, accesionArgs, _ := accessionDs.ToSQL()
	insertAccessionResult, insertAccessionErr := transaction.Exec(insertAccessionQuery, accesionArgs...)

	if insertAccessionErr != nil {
		transaction.Rollback()
		logger.Error(insertAccessionErr.Error(), slimlog.Function("CirculationRepository.NewTransaction"), slimlog.Error("insertAccessionErr"))
		return insertAccessionErr
	}
	transaction.Commit()
	insertTransactionAffectedRows, _ := insertTransactionResult.RowsAffected()
	insertAccessionAffectedRows, _ := insertAccessionResult.RowsAffected()
	logger.Info("Transaction created.", slimlog.AffectedRows(insertTransactionAffectedRows))
	logger.Info("Book borrowed inserted.", slimlog.AffectedRows(insertAccessionAffectedRows))
	return nil
}

func (repo *CirculationRepository) ReturnBooksByTransactionId(id string, remarks string) error {

	transaction, transactErr := repo.db.Beginx()
	if transactErr != nil {
		transaction.Rollback()
		logger.Error(transactErr.Error(), slimlog.Function("CirculationRepository.ReturnBooksByTransactionId"), slimlog.Error("transactErr"))
		return transactErr
	}
	updateBorrowTransactionQuery := `UPDATE circulation.borrow_transaction SET returned_at = now(), remarks= $1 where id = $2`

	updateBorrowTransactionResult, updateBorrowTransactionErr := transaction.Exec(updateBorrowTransactionQuery, remarks, id)

	if updateBorrowTransactionErr != nil {
		transaction.Rollback()
		logger.Error(updateBorrowTransactionErr.Error(), slimlog.Function("CirculationRepository.ReturnBooksByTransactionId"), slimlog.Error("updateBorrowTransactionErr"))
		return updateBorrowTransactionErr
	}
	updateBookBorrowedQuery := `UPDATE circulation.borrowed_book SET returned_at = now() where transaction_id = $1`
	updateBookBorrowResult, updateBookBorrowedErr := transaction.Exec(updateBookBorrowedQuery, id)

	if updateBookBorrowedErr != nil {
		transaction.Rollback()
		logger.Error(updateBorrowTransactionErr.Error(), slimlog.Function("CirculationRepository.ReturnBooksByTransactionId"), slimlog.Error("updateBookBorrowedErr"))
		return updateBorrowTransactionErr
	}

	transaction.Commit()
	updateBookTransactionAffected, _ := updateBorrowTransactionResult.RowsAffected()
	updateBookBorrowedAffected, _ := updateBookBorrowResult.RowsAffected()
	logger.Info("Book transaction updated.", slimlog.AffectedRows(updateBookTransactionAffected))
	logger.Info("Borrowed books update.", slimlog.AffectedRows(updateBookBorrowedAffected))
	return nil
}
func (repo *CirculationRepository) ReturnBookCopy(transactionId string, bookId string, accessionNumber int) error {
	transaction, transactErr := repo.db.Beginx()
	if transactErr != nil {
		transaction.Rollback()
		logger.Error(transactErr.Error(), slimlog.Function("CirculationRepository.ReturnBookCopy"), slimlog.Error("transactErr"))
		return transactErr
	}

	updateQuery := `UPDATE circulation.borrowed_book SET returned_at = now() where transaction_id = $1 AND book_id = $2 AND accession_number = $3`
	_, updateErr := transaction.Exec(updateQuery, transactionId, bookId, accessionNumber)
	if updateErr != nil {
		transaction.Rollback()
		logger.Error(updateErr.Error(), slimlog.Function("CirculationRepository.ReturnBookCopy"), slimlog.Error("updateErr"))
	}

	//check if the books have been returned. If returned, mark the transaction as returned.
	checkReturnedCopyQuery := `SELECT EXISTS(SELECT 1 FROM circulation.borrowed_book where transaction_id = $1  AND returned_at is null )`
	exists := false
	transaction.Get(&exists, checkReturnedCopyQuery, transactionId)
	if !exists {
		updateBorrowTransactionQuery := `UPDATE circulation.borrow_transaction SET returned_at = now() where id = $1`
		_, updateBorrowTransactionErr := transaction.Exec(updateBorrowTransactionQuery, transactionId)
		if updateBorrowTransactionErr != nil {
			transaction.Rollback()
			logger.Error(updateBorrowTransactionErr.Error(), slimlog.Function("CirculationRepository.ReturnBookCopy"), slimlog.Error("updateBorrowTransactionErr"))
			return updateBorrowTransactionErr
		}
	}
	transaction.Commit()
	return updateErr
}
func (repo * CirculationRepository) AddItemToBag(item model.BagItem) error{
	query := `INSERT INTO circulation.bag(accession_id, account_id) VALUES($1, $2)`
	_, insertErr := repo.db.Exec(query, item.AccessionId, item.AccountId)
    if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function("CirculationRepository.AddItemToBag"), slimlog.Error("insertErr"))
	}
	return insertErr

}
func (repo * CirculationRepository) GetItemsFromBagByAccountId(accountId string) []model.BagItem{
	items := make([]model.BagItem, 0)
	query:= `SELECT bag.id, bag.account_id, bag.accession_id, accession.number, accession.copy_number, is_checked, book.json_format as book,	
	(CASE WHEN bb.accession_number is not null or obb.accession_id is not null then false else true END) as is_available FROM circulation.bag
	INNER JOIN get_accession_table() as accession on bag.accession_id = accession.id
	INNER JOIN book_view as book on accession.book_id = book.id
	LEFT JOIN circulation.borrowed_book 
	as bb on accession.book_id = bb.book_id AND accession.number = bb.accession_number AND returned_at is NULL
	LEFT JOIN circulation.online_borrowed_book as obb on accession.id = obb.accession_id and obb.status != 'returned' and obb.status != 'cancelled' and obb.status != 'unreturned'
	where bag.account_id = $1`
	selectErr := repo.db.Select(&items, query, accountId,)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("CirculationRepository.GetItemsFromBagByAccountId"), slimlog.Error("selectErr"))
	}
	return items
}

func (repo * CirculationRepository) DeleteItemFromBag(item model.BagItem) error {
	query:= `DELETE FROM circulation.bag where id = $1 and  account_id = $2`
	_, deleteErr:= repo.db.Exec(query,  item.Id, item.AccountId )
	if deleteErr!= nil {
		logger.Error(deleteErr.Error(), slimlog.Function("CirculationRepository.DeleteItemFromBag"), slimlog.Error("deleteErr"))
	}
	return deleteErr
}
func(repo * CirculationRepository)CheckItemFromBag(item model.BagItem) error {

	query := `UPDATE circulation.bag set is_checked = not is_checked where id = $1 and account_id =  $2`

	_, updateErr := repo.db.Exec(query, item.Id, item.AccountId)
	if updateErr != nil {
		logger.Error(updateErr.Error(), slimlog.Function("CirculationRepository.CheckItemFromBag"), slimlog.Error("updateErr"))
	}
	return updateErr
}
func (repo * CirculationRepository)CheckAllItemsFromBag(accountId string) error {
	
	query := `UPDATE circulation.bag set is_checked = true where account_id =  $1`
	_, updateErr := repo.db.Exec(query, accountId)
	if updateErr != nil {
		logger.Error(updateErr.Error(), slimlog.Function("CirculationRepository.CheckAllItemsFromBag"), slimlog.Error("updateErr"))
	}
	return updateErr
}
func (repo * CirculationRepository)UncheckAllItemsFromBag(accountId string) error {
	
	query := `UPDATE circulation.bag set is_checked = false where account_id =  $1`
	_, updateErr := repo.db.Exec(query, accountId)
	if updateErr != nil {
		logger.Error(updateErr.Error(), slimlog.Function("CirculationRepository.CheckAllItemsFromBag"), slimlog.Error("updateErr"))
	}
	return updateErr
}
func (repo * CirculationRepository) DeleteAllCheckedItems(accountId string) error {
	query:= `DELETE FROM circulation.bag where is_checked = true and  account_id = $1`
	_, deleteErr:= repo.db.Exec(query,  accountId)
	if deleteErr!= nil {
		logger.Error(deleteErr.Error(), slimlog.Function("CirculationRepository.DeleteAllCheckedItems"), slimlog.Error("deleteErr"))
	}
	return deleteErr
}
func (repo * CirculationRepository) CheckoutCheckedItems(accountId string) error {

	settings := repo.settingRepository.Get()
	if settings.DuePenalty.Value == 0 {
		settingsErr := fmt.Errorf("due penalty value is 0")
		logger.Error(settingsErr.Error(), slimlog.Function("CirculationRepository.CheckoutCheckedItems"), slimlog.Error("DuePenaltySettings"))
		return settingsErr
	}
	items := make([]model.BagItem, 0)
	transaction, transactErr := repo.db.Beginx()
	if transactErr != nil {
		transaction.Rollback()
		logger.Error(transactErr.Error(), slimlog.Function("CirculationRepository.CheckoutCheckedItems"), slimlog.Error("transactErr"))
		return transactErr
	}
	query:= `
	SELECT bag.id, bag.account_id, bag.accession_id, accession.number, accession.copy_number, is_checked FROM circulation.bag
	INNER JOIN get_accession_table() as accession on bag.accession_id = accession.id
	LEFT JOIN circulation.borrowed_book 
	as bb on accession.book_id = bb.book_id AND accession.number = bb.accession_number AND returned_at is NULL
	LEFT JOIN circulation.online_borrowed_book as obb on accession.id = obb.accession_id and obb.status != 'returned' and obb.status != 'cancelled' and obb.status != 'unreturned'
	where (CASE WHEN bb.accession_number is not null or obb.accession_id is not null then false else true END) = true AND bag.account_id = $1 AND bag.is_checked = true
	`
	selectErr := transaction.Select(&items, query, accountId)
	if selectErr != nil {
		transaction.Rollback()
		logger.Error(selectErr.Error(), slimlog.Function("CirculationRepository.CheckoutCheckedItems"), slimlog.Error("selectErr"))
		return selectErr
	}
	if len(items) == 0{
		transaction.Rollback()
		return nil
	}
	dialect := goqu.Dialect("postgres")
	deleteDS := dialect.From(goqu.T("bag").Schema("circulation")).Delete()
	var itemsToCheckout []goqu.Record = make([]goqu.Record, 0)
	var itemIdsToDelete []string =  make([]string, 0)
	
	for _, item := range items{
		
		itemIdsToDelete =  append(itemIdsToDelete, item.Id)
		itemsToCheckout = append(itemsToCheckout, goqu.Record{
			"accession_id": item.AccessionId,
			"account_id": item.AccountId,
			"status":  status.OnlineBorrowStatuses.Pending,
			"penalty_on_past_due": settings.DuePenalty.Value,
		})
	}
	deleteDS = deleteDS.Where(goqu.C("id").In(itemIdsToDelete))
	checkoutDS  := dialect.From(goqu.T("online_borrowed_book").Schema("circulation")).Prepared(true).Insert().Rows(itemsToCheckout)
	checkoutQuery, checkoutArgs, _ := checkoutDS.ToSQL()
	_, insertCheckoutErr := transaction.Exec(checkoutQuery, checkoutArgs...)

	if insertCheckoutErr != nil {
		transaction.Rollback()
		logger.Error(insertCheckoutErr.Error(), slimlog.Function("CirculationRepository.CheckoutCheckedItems"), slimlog.Error("insertCheckoutErr"))
		return insertCheckoutErr
	}

	deleteQuery, _, deleteQueryBuildErr := deleteDS.ToSQL()
	if deleteQueryBuildErr != nil {
		transaction.Rollback()
		logger.Error(deleteQueryBuildErr.Error(), slimlog.Function("CirculationRepository.CheckoutCheckedItems"), slimlog.Error("deleteQueryBuildErr"))
		return insertCheckoutErr
	}
	_, deleteCheckedItemsFromBagErr := transaction.Exec(deleteQuery)
	if deleteCheckedItemsFromBagErr != nil {
		transaction.Rollback()
		logger.Error(deleteCheckedItemsFromBagErr.Error(),  slimlog.Function("CirculationRepository.CheckoutCheckedItems"), slimlog.Error("deleteCheckedItemsFromBagErr"))
		return deleteCheckedItemsFromBagErr
	}
	transaction.Commit()
	return nil
}
func (repo * CirculationRepository) GetOnlineBorrowedBooksByAccountIDAndStatus(accountId string, status string) []model.OnlineBorrowedBook{
	borrowedBooks := make([]model.OnlineBorrowedBook, 0)

	query := `SELECT id,account_id, accession_id, due_date, number, copy_number, status, book, penalty, remarks
	FROM online_borrowed_book_view
	 where account_id = $1 and status = $2
	ORDER BY created_at desc
	`
	// query:= `SELECT obb.id, obb.account_id, obb.accession_id, obb.due_date, accession.number, accession.copy_number,obb.status ,book.json_format as book FROM circulation.online_borrowed_book as obb
	// INNER JOIN get_accession_table() as accession on obb.accession_id = accession.id
	// INNER JOIN book_view as book on accession.book_id = book.id 
	
	// `
	selectErr := repo.db.Select(&borrowedBooks, query, accountId, status)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("CirculationRepository.GetOnlineBorrowedBooksByAccountIdAndStatus"), slimlog.Error("selectErr"))
	}
	return borrowedBooks
}
func (repo * CirculationRepository) GetOnlineBorrowedBooksByAccountID(accountId string) []model.OnlineBorrowedBook{
	borrowedBooks := make([]model.OnlineBorrowedBook, 0)
	query:= `SELECT id,account_id, accession_id, due_date, number, copy_number, status, book, penalty, remarks
	FROM online_borrowed_book_view
	where account_id = $1
	ORDER BY created_at desc
	`
	selectErr := repo.db.Select(&borrowedBooks, query, accountId)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("CirculationRepository.GetOnlineBorrowedBooksByAccountId"), slimlog.Error("selectErr"))
	}
	return borrowedBooks
}
func (repo * CirculationRepository) GetOnlineBorrowedBookByStatus( status string) []model.OnlineBorrowedBook{
	borrowedBooks := make([]model.OnlineBorrowedBook, 0)
	query:= `SELECT id,account_id, accession_id, due_date, number, copy_number, status, book, penalty, remarks, client
	FROM online_borrowed_book_view
	where status = $1
	ORDER BY created_at desc
	`
	selectErr := repo.db.Select(&borrowedBooks, query, status)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("CirculationRepository.GetOnlineBorrowedBookByStatus"), slimlog.Error("selectErr"))
	}
	return borrowedBooks
}
func (repo * CirculationRepository) GetAllOnlineBorrowedBooks() []model.OnlineBorrowedBook{
	borrowedBooks := make([]model.OnlineBorrowedBook, 0)
	query:= `SELECT id,account_id, accession_id, due_date, number, copy_number, status, book, penalty, remarks, client
	FROM online_borrowed_book_view
	ORDER BY created_at desc
	`
	selectErr := repo.db.Select(&borrowedBooks, query)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("CirculationRepository.GetOnlineBorrowedBookByStatus"), slimlog.Error("selectErr"))
	}
	return borrowedBooks
}
func (repo * CirculationRepository) GetOnlineBorrowedBookById(id string) model.OnlineBorrowedBook{
	borrowedBook := model.OnlineBorrowedBook{}
	query:= `SELECT id,account_id, accession_id, due_date, number, copy_number, status, book, penalty, remarks, client
	FROM online_borrowed_book_view
	where id = $1
	ORDER BY created_at desc
	`
	getErr := repo.db.Get(&borrowedBook, query, id)

	if getErr != nil {
		logger.Error(getErr.Error(), slimlog.Function("CirculationRepository.GetOnlineBorrowedBookBy"), slimlog.Error("getErr"))
	}
	return borrowedBook
}


func (repo * CirculationRepository) UpdateBorrowRequestStatus(id string,  status string) error{
	query:= `Update circulation.online_borrowed_book SET status = $1 where id = $2`
	_, updateErr := repo.db.Exec(query, status, id )
	if(updateErr != nil){
		logger.Error(updateErr.Error(),  slimlog.Function("CirculationRepository.UpdateBorrowRequestStatus"), slimlog.Error("updateErr"))
	}
	return updateErr
}

func (repo * CirculationRepository) UpdateBorrowRequestStatusAndDueDate(borrowedBook model.OnlineBorrowedBook ) error{
	query:= `Update circulation.online_borrowed_book SET status = $1, due_date = $2 where id = $3`
	_, updateErr := repo.db.Exec(query, borrowedBook.Status, borrowedBook.DueDate, borrowedBook.Id)
	if(updateErr != nil){
		logger.Error(updateErr.Error(),  slimlog.Function("CirculationRepository.UpdateBorrowRequestStatusAndDueDate"), slimlog.Error("updateErr"))
	}
	return updateErr
}
func (repo * CirculationRepository) UpdateBorrowRequestStatusAndRemarks(borrowedBook model.OnlineBorrowedBook ) error{

	query:= `Update circulation.online_borrowed_book SET status = $1, remarks = $2 where id = $3`
	_, updateErr := repo.db.Exec(query, borrowedBook.Status, borrowedBook.Remarks, borrowedBook.Id)
	if(updateErr != nil){
		logger.Error(updateErr.Error(),  slimlog.Function("CirculationRepository.UpdateBorrowRequestStatusAndDueDate"), slimlog.Error("updateErr"))
	}
	
	return updateErr
}

func (repo * CirculationRepository )AddPenaltyOnlineBorrowedBook (id string) error{
	transaction, transactErr := repo.db.Beginx()

	if transactErr != nil {
		transaction.Rollback()
		logger.Error(transactErr.Error(), slimlog.Function("CirculationRepository.AddPenaltyForDelayedReturnOfOnlineBorrowedBook "), slimlog.Error("transactErr"), )
		return transactErr
	} 
	borrowedBook := model.OnlineBorrowedBook{}
	getQuery := `
	SELECT id, account_id, accession_id, due_date, number, copy_number, status, book,  
	case when (now()::date - due_date) < 0 then 0 else (now()::date - due_date) end * penalty_on_past_due as penalty,
	remarks, client
	FROM online_borrowed_book_view
	where id = $1 and status in ('returned', 'unreturned')
	ORDER BY created_at desc
	LIMIT 1
	`
	
	getErr := transaction.Get(&borrowedBook, getQuery, id)
	fmt.Println(borrowedBook)
	if getErr != nil {
		transaction.Rollback()
		logger.Error(transactErr.Error(), slimlog.Function("CirculationRepository.AddPenaltyForDelayedReturnOfOnlineBorrowedBook "), slimlog.Error("getEr") )
		return getErr
	}
	if len(borrowedBook.Id) > 0 && borrowedBook.Penalty > 0 {
	
	description := fmt.Sprintf(`
This to inform you that you have been penalized for delayed return of the book.
				
Book Details:
Title: %s
Due Date: %s
Penalty: %.2f

We kindly remind you to promptly return the book and settle the penalty to avoid any further consequences. 
Please note that failing to return library materials on time disrupts the borrowing system and may inconvenience other library users.
If you have any questions or require assistance, please contact our library staff. Thank you for your immediate attention to this matter.`,
		borrowedBook.Book.Title,  borrowedBook.DueDate, borrowedBook.Penalty) 
		
	
		insertQuery := "INSERT INTO circulation.penalty(description, amount, account_id) VALUES($1, $2, $3)"
		_, insertErr := transaction.Exec(insertQuery, description, borrowedBook.Penalty, borrowedBook.AccountId)
		if insertErr != nil{
			transaction.Rollback()
			logger.Error(insertErr.Error(),slimlog.Function("CirculationRepository.AddPenaltyForDelayedReturnOfOnlineBorrowedBook "), slimlog.Error("insertErr") )
			return insertErr
		}
	}
	transaction.Commit()
	return nil
}







func NewCirculationRepository() CirculationRepositoryInterface {
	return &CirculationRepository{
		db: postgresdb.GetOrCreateInstance(),
		settingRepository: NewSettingsRepository(),
	}
}

type CirculationRepositoryInterface interface {
	GetBorrowingTransactions() []model.BorrowingTransaction
	GetBorrowingTransactionById(id string) model.BorrowingTransaction
	NewTransaction(clientId string, dueDate db.NullableDate, accession []model.Accession) error
	ReturnBooksByTransactionId(id string, remarks string) error
	ReturnBookCopy(transactionId string, bookId string, accessionNumber int) error
	AddItemToBag(model.BagItem) error
	GetItemsFromBagByAccountId(accountId string) []model.BagItem
	DeleteItemFromBag(item model.BagItem) error
	CheckItemFromBag(item model.BagItem) error
	CheckAllItemsFromBag(accountId string) error
	UncheckAllItemsFromBag(accountId string) error
	DeleteAllCheckedItems(accountId string) error
	CheckoutCheckedItems(accountId string) error
	GetOnlineBorrowedBooksByAccountIDAndStatus(accountId string, status string)[]model.OnlineBorrowedBook
	GetOnlineBorrowedBookByStatus( status string) []model.OnlineBorrowedBook
	GetAllOnlineBorrowedBooks() []model.OnlineBorrowedBook
	UpdateBorrowRequestStatus(id string,  status string) error
	UpdateBorrowRequestStatusAndDueDate(borrowedBook model.OnlineBorrowedBook ) error
	GetOnlineBorrowedBookById(id string) model.OnlineBorrowedBook
	UpdateBorrowRequestStatusAndRemarks(borrowedBook model.OnlineBorrowedBook ) error
	GetOnlineBorrowedBooksByAccountID(accountId string) []model.OnlineBorrowedBook
	AddPenaltyOnlineBorrowedBook(id string) error
	
}
