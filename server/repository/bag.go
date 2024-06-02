package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/status"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
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
	CheckoutCheckedItems(accountId string) (string, error)
}
type Bag struct {
	db * sqlx.DB
	settingsRepo  SettingsRepository
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
	query:= `SELECT bag.id, bag.account_id, bag.accession_id, bag.accession_number, bag.copy_number, bag.is_checked,bag.is_ebook, bag.book,	
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
	transaction ,err := repo.db.Beginx()
	if err != nil {
		 return err
	}
	isEbook := false
	err = transaction.Get(&isEbook, "Select is_ebook as isEbook from bag_view where id = $1 and account_id = $2 LIMIT 1", item.Id, item.AccountId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	if isEbook {
		_, err = transaction.Exec("DELETE FROM circulation.ebook_bag where id = $1 and account_id =  $2", item.Id , item.AccountId)
		if err != nil {
			transaction.Rollback()
			return err
		}
		transaction.Commit()
		return nil
	}
	query := `DELETE FROM circulation.bag where id = $1 and account_id =  $2`
	_, err  = transaction.Exec(query, item.Id, item.AccountId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	transaction.Commit()
	return err
}
func(repo * Bag)CheckItemFromBag(item model.BagItem) error {
	transaction ,err := repo.db.Beginx()
	if err != nil {
		 return err
	}
	isEbook := false
	err = transaction.Get(&isEbook, "Select is_ebook as isEbook from bag_view where id = $1 and account_id = $2 LIMIT 1", item.Id, item.AccountId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	if isEbook {
		_, err = transaction.Exec("UPDATE circulation.ebook_bag set is_checked = not is_checked where id = $1 and account_id =  $2", item.Id , item.AccountId)
		if err != nil {
			transaction.Rollback()
			return err
		}
		transaction.Commit()
		return nil
	}
	query := `UPDATE circulation.bag set is_checked = not is_checked where id = $1 and account_id =  $2`
	_, err  = transaction.Exec(query, item.Id, item.AccountId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	transaction.Commit()
	return err
}
func (repo * Bag)CheckAllItemsFromBag(accountId string) error {
	transaction, err  := repo.db.Beginx()
	if err != nil {
		return err
	}
	query := `UPDATE circulation.bag set is_checked = true where account_id =  $1`
	_, err = transaction.Exec(query, accountId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	
	query = `UPDATE circulation.ebook_bag set is_checked = true where account_id =  $1`
	_, err = transaction.Exec(query, accountId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	transaction.Commit()
	return err
}
func (repo * Bag)UncheckAllItemsFromBag(accountId string) error {
	
	transaction, err  := repo.db.Beginx()
	if err != nil {
		return err
	}
	query := `UPDATE circulation.bag set is_checked = false where account_id =  $1`
	_, err = transaction.Exec(query, accountId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	
	query = `UPDATE circulation.ebook_bag set is_checked = false where account_id =  $1`
	_, err = transaction.Exec(query, accountId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	transaction.Commit()
	return err
}
func (repo * Bag) DeleteAllCheckedItems(accountId string) error {
	transaction, err  := repo.db.Beginx()
	if err != nil {
		return err
	}
	query := `DELETE FROM circulation.bag  where account_id =  $1 and is_checked = true`
	_, err = transaction.Exec(query, accountId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	
	query = `DELETE FROM circulation.ebook_bag  where account_id =  $1 and is_checked=true`
	_, err = transaction.Exec(query, accountId)
	if err != nil {
		transaction.Rollback()
		return err
	}
	transaction.Commit()
	return err
}

func (repo * Bag) CheckoutCheckedItems(accountId string) (string, error) {
	settings := repo.settingsRepo.Get()
	if settings.DuePenalty.Value == 0 {
		settingsErr := fmt.Errorf("due penalty value is 0")
		logger.Error(settingsErr.Error(), slimlog.Function("BagRepository.CheckoutCheckedItems"), slimlog.Error("DuePenaltySettings"))
		return "", settingsErr
	}

	transaction, transactErr := repo.db.Beginx()
	if transactErr != nil {
		transaction.Rollback()
		logger.Error(transactErr.Error(), slimlog.Function("BagRepository.CheckoutCheckedItems"), slimlog.Error("transactErr"))
		return "", transactErr
	}
	query:= `
	SELECT bag.id, bag.account_id, bag.accession_id, bag.accession_number, bag.copy_number, bag.book_id, is_checked, bag.is_ebook, (CASE WHEN bb.accession_id is not null then false else true END) as is_available  FROM bag_view as bag
	LEFT JOIN borrowing.borrowed_book  
	as bb on bag.accession_id = bb.accession_id   AND (status_id = 1 OR status_id = 2 OR status_id = 3) 
	where (CASE WHEN bb.accession_id is not null then false else true END) = true and bag.account_id = $1 and bag.is_checked = true
	`
	
	items := make([]model.BagItem, 0)
	
	err := transaction.Select(&items, query, accountId)
	if err != nil {
	
		transaction.Rollback()
		return "", err
	}
	groupId := uuid.New().String()
	physicalBooks := make([]model.BorrowedBook, 0)	
	ebooks:= make([]model.BorrowedEBook, 0)
	for _, item := range items{
		
		if item.IsEbook {
		   ebooks = append(ebooks, model.BorrowedEBook{
				  GroupId: groupId,
				  StatusId: status.BorrowStatusPending,
				  AccountId: accountId,
				  BookId: item.BookId,
			})
			continue
		}
		physicalBooks = append(physicalBooks, model.BorrowedBook{
			GroupId: groupId,
			AccessionId: item.AccessionId,
			AccountId: accountId,
			StatusId: status.BorrowStatusPending,
			PenaltyOnPastDue: settings.DuePenalty.Value,
		})
	}

	if  len(physicalBooks) > 0  {
		_, err = transaction.NamedExec("INSERT INTO borrowing.borrowed_book(accession_id, group_id, account_id, status_id, penalty_on_past_due ) VALUES(:accession_id, :group_id, :account_id, :status_id, :penalty_on_past_due)", physicalBooks)
		if err != nil {
			transaction.Rollback()
			return "",err
		}
	}
	if len(ebooks) > 0 {
		_, err = transaction.NamedExec("INSERT INTO borrowing.borrowed_ebook(book_id, group_id, account_id, status_id ) VALUES(:book_id, :group_id, :account_id, :status_id)", ebooks)
		if err != nil {
			transaction.Rollback()
			return "",err
		}
	}

	query = `DELETE FROM circulation.bag  where account_id =  $1 and is_checked = true`
	_, err = transaction.Exec(query, accountId)
	if err != nil {
		transaction.Rollback()
		return "",err
	}
	
	query = `DELETE FROM circulation.ebook_bag  where account_id =  $1 and is_checked=true`
	_, err = transaction.Exec(query, accountId)
	if err != nil {
		transaction.Rollback()
		return "",err
	}

	transaction.Commit()
	return groupId,nil
}
func NewBagRepository (db * sqlx.DB, settingsRepo  SettingsRepository) BagRepository {
	return &Bag{
		db: db,
		settingsRepo: settingsRepo,
	}
}