package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/status"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)


type BagRepository interface {
	AddItemToBag(item model.BagItem) error
	GetItemsFromBagByAccountId(accountId string) []model.BagItem
	DeleteItemFromBag(item model.BagItem) error
	CheckItemFromBag(item model.BagItem) error
	CheckAllItemsFromBag(accountId string) error
	UncheckAllItemsFromBag(accountId string) error
	DeleteAllCheckedItems(accountId string) error 
	CheckoutCheckedItems(accountId string) error
}
type Bag struct {
	db * sqlx.DB
	settingsRepo SettingsRepositoryInterface
}

func (repo * Bag) AddItemToBag(item model.BagItem) error{
	if(len(item.AccessionId) > 0){
		query := `INSERT INTO circulation.bag(accession_id, account_id) VALUES($1, $2)`
		_, insertErr := repo.db.Exec(query, item.AccessionId, item.AccountId)
		if insertErr != nil {
			return insertErr
		}
		return nil
	}
	query := `INSERT INTO circulation.ebook_bag(book_id, account_id) VALUES($1, $2)`
	_, insertErr := repo.db.Exec(query, item.BookId, item.AccountId)
	if insertErr != nil {
			return insertErr
	}	
	return nil
}
func (repo * Bag) GetItemsFromBagByAccountId(accountId string) []model.BagItem{
	items := make([]model.BagItem, 0)
	query:= `SELECT bag.id, bag.account_id, bag.accession_id, bag.accession_number, bag.copy_number, bag.is_checked, bag.book,	
	(CASE WHEN bb.accession_id is not null then false else true END) as is_available FROM bag_view as bag
	LEFT JOIN borrowing.borrowed_book
	as bb on bag.accession_id = bb.accession_id AND (status_id = 1 OR status_id = 2 OR status_id = 3) 
	where bag.account_id = $1
	`
	selectErr := repo.db.Select(&items, query, accountId,)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("Bag.GetItemsFromBagByAccountId"), slimlog.Error("selectErr"))
	}
	return items
}

func (repo * Bag) DeleteItemFromBag(item model.BagItem) error {
	query:= `DELETE FROM circulation.bag where id = $1 and  account_id = $2`
	_, deleteErr:= repo.db.Exec(query,  item.Id, item.AccountId )
	if deleteErr!= nil {
		logger.Error(deleteErr.Error(), slimlog.Function("Bag.DeleteItemFromBag"), slimlog.Error("deleteErr"))
	}
	return deleteErr
}
func(repo * Bag)CheckItemFromBag(item model.BagItem) error {

	query := `UPDATE circulation.bag set is_checked = not is_checked where id = $1 and account_id =  $2`

	_, updateErr := repo.db.Exec(query, item.Id, item.AccountId)
	if updateErr != nil {
		logger.Error(updateErr.Error(), slimlog.Function("Bag.CheckItemFromBag"), slimlog.Error("updateErr"))
	}
	return updateErr
}
func (repo * Bag)CheckAllItemsFromBag(accountId string) error {
	
	query := `UPDATE circulation.bag set is_checked = true where account_id =  $1`
	_, updateErr := repo.db.Exec(query, accountId)
	if updateErr != nil {
		logger.Error(updateErr.Error(), slimlog.Function("Bag.CheckAllItemsFromBag"), slimlog.Error("updateErr"))
	}
	return updateErr
}
func (repo * Bag)UncheckAllItemsFromBag(accountId string) error {
	
	query := `UPDATE circulation.bag set is_checked = false where account_id =  $1`
	_, updateErr := repo.db.Exec(query, accountId)
	if updateErr != nil {
		logger.Error(updateErr.Error(), slimlog.Function("Bag.CheckAllItemsFromBag"), slimlog.Error("updateErr"))
	}
	return updateErr
}
func (repo * Bag) DeleteAllCheckedItems(accountId string) error {
	query:= `DELETE FROM circulation.bag where is_checked = true and  account_id = $1`
	_, deleteErr:= repo.db.Exec(query,  accountId)
	if deleteErr!= nil {
		logger.Error(deleteErr.Error(), slimlog.Function("Bag.DeleteAllCheckedItems"), slimlog.Error("deleteErr"))
	}
	return deleteErr
}

func (repo * Bag) CheckoutCheckedItems(accountId string) error {

	settings := repo.settingsRepo.Get()
	if settings.DuePenalty.Value == 0 {
		settingsErr := fmt.Errorf("due penalty value is 0")
		logger.Error(settingsErr.Error(), slimlog.Function("BagRepository.CheckoutCheckedItems"), slimlog.Error("DuePenaltySettings"))
		return settingsErr
	}
	items := make([]model.BagItem, 0)
	transaction, transactErr := repo.db.Beginx()
	if transactErr != nil {
		transaction.Rollback()
		logger.Error(transactErr.Error(), slimlog.Function("BagRepository.CheckoutCheckedItems"), slimlog.Error("transactErr"))
		return transactErr
	}
	query:= `
	SELECT bag.id, bag.account_id, bag.accession_id, accession.number, accession.copy_number, is_checked FROM circulation.bag
	INNER JOIN catalog.accession as accession on bag.accession_id = accession.id and accession.weeded_at is null
	LEFT JOIN borrowing.borrowed_book 
	as bb on bb.accession_id = bag.accession_id AND (status_id = 1 OR status_id = 2 OR status_id = 3) 
	where (CASE WHEN bb.accession_id is not null then false else true END) = true AND bag.account_id = $1 AND bag.is_checked = true
	`
	selectErr := transaction.Select(&items, query, accountId)
	if selectErr != nil {
		transaction.Rollback()
		logger.Error(selectErr.Error(), slimlog.Function("BagRepository.CheckoutCheckedItems"), slimlog.Error("selectErr"))
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
	groupId := uuid.New().String()
	for _, item := range items{
		
		itemIdsToDelete =  append(itemIdsToDelete, item.Id)
		itemsToCheckout = append(itemsToCheckout, goqu.Record{
			"accession_id": item.AccessionId,
			"account_id": item.AccountId,
			"group_id": groupId,
			"status_id":  status.BorrowStatusPending,
			"penalty_on_past_due": settings.DuePenalty.Value,
		})
	}
	deleteDS = deleteDS.Where(goqu.C("id").In(itemIdsToDelete))
	checkoutDS  := dialect.From(goqu.T("borrowed_book").Schema("borrowing")).Prepared(true).Insert().Rows(itemsToCheckout)
	checkoutQuery, checkoutArgs, _ := checkoutDS.ToSQL()
	_, insertCheckoutErr := transaction.Exec(checkoutQuery, checkoutArgs...)

	if insertCheckoutErr != nil {
		transaction.Rollback()
		logger.Error(insertCheckoutErr.Error(), slimlog.Function("BagRepository.CheckoutCheckedItems"), slimlog.Error("insertCheckoutErr"))
		return insertCheckoutErr
	}

	deleteQuery, _, deleteQueryBuildErr := deleteDS.ToSQL()
	if deleteQueryBuildErr != nil {
		transaction.Rollback()
		logger.Error(deleteQueryBuildErr.Error(), slimlog.Function("BagRepository.CheckoutCheckedItems"), slimlog.Error("deleteQueryBuildErr"))
		return insertCheckoutErr
	}
	_, deleteCheckedItemsFromBagErr := transaction.Exec(deleteQuery)
	if deleteCheckedItemsFromBagErr != nil {
		transaction.Rollback()
		logger.Error(deleteCheckedItemsFromBagErr.Error(),  slimlog.Function("BagRepository.CheckoutCheckedItems"), slimlog.Error("deleteCheckedItemsFromBagErr"))
		return deleteCheckedItemsFromBagErr
	}
	transaction.Commit()
	return nil
}



func NewBagRepository () BagRepository {
	return &Bag{
		db: db.Connect(),
		settingsRepo: NewSettingsRepository(),
	}
}