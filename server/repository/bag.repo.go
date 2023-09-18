package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
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
}
type Bag struct {
	db * sqlx.DB
}

func (repo * Bag) AddItemToBag(item model.BagItem) error{
	query := `INSERT INTO circulation.bag(accession_id, account_id) VALUES($1, $2)`
	_, insertErr := repo.db.Exec(query, item.AccessionId, item.AccountId)
    if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function("Bag.AddItemToBag"), slimlog.Error("insertErr"))
	}
	return insertErr

}
func (repo * Bag) GetItemsFromBagByAccountId(accountId string) []model.BagItem{
	items := make([]model.BagItem, 0)
	query:= `SELECT bag.id, bag.account_id, bag.accession_id, accession.number, accession.copy_number, is_checked, book.json_format as book,	
	(CASE WHEN bb.accession_id is not null then false else true END) as is_available FROM circulation.bag
	INNER JOIN get_accession_table() as accession on bag.accession_id = accession.id
	INNER JOIN book_view as book on accession.book_id = book.id
	LEFT JOIN borrowing.borrowed_book
	as bb on accession.id = bb.accession_id AND (status_id = 1 OR status_id = 2 OR status_id = 3 OR status_id = 6) 
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


func NewBagRepository () BagRepository {
	return &Bag{
		db: db.Connect(),
	}
}