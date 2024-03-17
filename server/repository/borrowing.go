package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/jmoiron/sqlx"
)

type BorrowingRepository interface {
	BorrowBook(borrowedBooks []model.BorrowedBook, borrowedEbooks []model.BorrowedEBook) error
	GetBorrowingRequests(filter * BorrowingRequestFilter)([]model.BorrowingRequest, Metadata, error)
	MarkAsReturned(id string, remarks string) error
	MarkAsUnreturned(id string, remarks string) error 
	MarkAsApproved(id string, remarks string) error 
	MarkAsCheckedOut(id string, remarks string, dueDate db.NullableDate) error
 	GetBorrowedBooksByGroupId(groupId string)([]model.BorrowedBook, error)
	GetBorrowedBooksByAccountId(accountId string)([]model.BorrowedBook, error)
	GetBorrowedBooksByAccountIdAndStatusId(accountId string, statusId int)([]model.BorrowedBook, error)
	MarkAsCancelled(id string, remarks string) error
	GetBorrowedEBookByIdAndStatus (id string, status int)(model.BorrowedBook, error)
	UpdateRemarks(id string, remarks string) error 
	CancelByIdAndAccountId(id string, remarks string, accountId string) error
	GetBookStatusBasedOnClient(bookId string, accountId string,)(model.BookStatus, error)
	GetBorrowedBookById(id string) (model.BorrowedBook, error)
	MarkAsReturnedWithAddtionalPenalty(id string, returnedBook model.ReturnBook) error
	GetBorrowedBooksByAccessionId(accessionId string)(model.BorrowedBook, error)
	GetCSVData(*BorrowingRequestFilter)([]model.BorrowedBookExport, error)
	GetExcelData(filter * BorrowingRequestFilter)([]map[string]interface{}, error)
}
type Borrowing struct{
	db * sqlx.DB

}
type BorrowingRequestFilter struct {
    From string
	To string
	Statuses []int
	SortBy string 
	Order string
	filter.Filter
}
func (repo * Borrowing)BorrowBook(borrowedBooks []model.BorrowedBook, borrowedEbooks []model.BorrowedEBook) error{
	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}

	if(len(borrowedBooks) > 0){
		_, err = transaction.NamedExec("INSERT INTO borrowing.borrowed_book(accession_id, group_id, account_id, status_id, due_date, penalty_on_past_due ) VALUES(:accession_id, :group_id, :account_id, :status_id, :due_date, :penalty_on_past_due)", borrowedBooks)
		if err != nil {
			transaction.Rollback()
			return err
		}
	}
	if(len(borrowedEbooks) == 0) {
		transaction.Commit()
		return nil
	} 
	_, err = transaction.NamedExec("INSERT INTO borrowing.borrowed_ebook(book_id, group_id, account_id, status_id, due_date ) VALUES(:book_id, :group_id, :account_id, :status_id, :due_date)", borrowedEbooks)
	if err != nil {
		transaction.Rollback()
		return err
	}
	transaction.Commit()
	return err
}
func (repo * Borrowing)GetBorrowingRequests(filter * BorrowingRequestFilter)([]model.BorrowingRequest, Metadata, error){
	dialect := goqu.Dialect("postgres")
	ds := dialect.Select(
		goqu.C("group_id").As("id"),
		goqu.C("account_id"),
		goqu.C("client"),
		goqu.L("SUM(penalty)").As("total_penalty"),
		goqu.L("COUNT(1) filter (where status_id = 1)  as total_pending"),
		goqu.L("COUNT(1) filter(where status_id = 2) as total_approved"),
		goqu.L("COUNT(1) filter (where status_id = 3) as total_checked_out"),
		goqu.L("COUNT(1) filter(where status_id = 4) as total_returned"),
		goqu.L("COUNT(1) filter(where status_id = 5) as total_cancelled"),
		goqu.L("COUNT(1) filter (where status_id = 6) as total_unreturned"),
		goqu.MAX("bbv.created_at").As("created_at"),
	).From(goqu.T("borrowed_book_all_view").As("bbv"))
	ds = repo.buildBorrowingRequestFilters(ds, filter)
	ds = ds.GroupBy("group_id", "account_id", "client").Prepared(true)
	ds = repo.buildSortOrder(ds, filter)
	ds = ds.Limit(uint(filter.Limit)).
	Offset(uint(filter.Offset))
	
    metadata := Metadata{}
	requests := make([]model.BorrowingRequest, 0) 
	query, args ,err := ds.ToSQL()
	fmt.Println(query)
    if err != nil {
		return requests, metadata, err
	}
	err = repo.db.Select(&requests, query, args...)
	if err != nil {
		return requests, metadata, err
	}
	ds = repo.buildBorrowingRequestMetadata(filter)
	query, args, err = ds.ToSQL()
	
	if err != nil {
		return requests, metadata, err
	}
	err = repo.db.Get(&metadata, query, args...)
	if err != nil {
		return requests, metadata, err
	}
	return requests, metadata, err
}
func (repo * Borrowing)buildBorrowingRequestMetadata(filter * BorrowingRequestFilter)(*goqu.SelectDataset) {
	dialect := goqu.Dialect("postgres")
	subDs := goqu.Select("group_id", goqu.MAX("created_at").As("created_at")).
	From(goqu.T("borrowed_book_all_view")).GroupBy("group_id").As("bbv")	
	subDs = repo.buildBorrowingRequestFilters(subDs, filter)
	ds := dialect.Select(
		goqu.Case().When(goqu.COUNT(1).Eq(0), 0).Else(goqu.L("Ceil((COUNT(1)/?::numeric))::bigint", filter.Limit)).As("pages"),
		goqu.COUNT(1).As("records"),
	).From(subDs)
	return ds
}
func (repo * Borrowing)buildBorrowingRequestFilters(ds * goqu.SelectDataset, filter * BorrowingRequestFilter)(*goqu.SelectDataset){
	if(len(filter.From) > 0 && len(filter.To) > 0) {
		ds = ds.Where(
			goqu.L("date(created_at at time zone 'PHT')").Between(goqu.Range(filter.From, filter.To)),
		) 
	}
	keyword := filter.Keyword
	if(len(keyword) > 0 ){
		ds = ds.Where(
			goqu.L(`	
		    (account_search_vector @@ (phraseto_tsquery('simple', ?) :: text) :: tsquery  
			OR 
			account_search_vector @@ (plainto_tsquery('simple', ?)::text) :: tsquery
			OR
			client ->> 'email' ILIKE '%' || ? || '%'
			OR 
			client ->> 'givenName' ILIKE '%' || ? || '%'
			OR
			client ->> 'surname' ILIKE'%' || ? || '%')
		  `, keyword, keyword, keyword, keyword, keyword),
		)
	}
	if (len(filter.Statuses) > 0){
		ds = ds.Where(goqu.Ex{
			"status_id" : filter.Statuses,
		})
	}
	return ds
}
func(repo * Borrowing)buildSortOrder(ds * goqu.SelectDataset, filter * BorrowingRequestFilter)(*goqu.SelectDataset){
	SortByColumnMap := map[string]string{
		"givenName": "client->>'givenName'",
		"surname": "client->>'surname'",
		"dateCreated": "created_at",
	}
	column, exists := SortByColumnMap[filter.SortBy]
	if(exists){
		if(filter.Order == "asc"){
			return ds.Order(exp.NewOrderedExpression(goqu.L(column), exp.AscDir, exp.NullsLastSortType))
		}
		if(filter.Order == "desc"){
			return ds.Order(exp.NewOrderedExpression(goqu.L(column), exp.DescSortDir, exp.NullsLastSortType))
		}
	}
	return ds.Order(exp.NewOrderedExpression(goqu.L("created_at"), exp.DescSortDir, exp.NoNullsSortType))
}
func (repo * Borrowing)GetBorrowedBooksByGroupId(groupId string)([]model.BorrowedBook, error){
	borrowedBooks := make([]model.BorrowedBook, 0) 
	query := `SELECT id, group_id, client, account_id, book, status, status_id, accession_id, number, copy_number, penalty, due_date, remarks, is_ebook,created_at FROM borrowed_book_all_view where group_id = $1`
	err := repo.db.Select(&borrowedBooks, query, groupId)
	return borrowedBooks, err
}
func (repo * Borrowing) GetBorrowedEBookByIdAndStatus (id string, status int)(model.BorrowedBook, error) {
	borrowedBook := model.BorrowedBook{}
	err := repo.db.Get(&borrowedBook, "SELECT id, group_id, client, account_id, book, status, status_id, accession_id, number, copy_number, penalty, due_date, remarks, is_ebook,created_at FROM borrowed_book_all_view WHERE id = $1 and is_ebook = true and status_id = $2", id, status)
	
	if err != nil {
		return borrowedBook, err
	}
	return borrowedBook,nil
}
func (repo * Borrowing) GetBorrowedBooksView (id string, status int)(model.BorrowedBook, error) {
	borrowedBook := model.BorrowedBook{}
	err := repo.db.Get(&borrowedBook, "SELECT id, group_id, client, account_id, book, status, status_id, accession_id, number, copy_number, penalty, due_date, remarks, is_ebook,created_at FROM borrowed_book_all_view WHERE id = $1 and is_ebook = true and status_id = $2", id, status)
	
	if err != nil {
		return borrowedBook, err
	}
	return borrowedBook,nil
}

func (repo * Borrowing)GetBorrowedBooksByAccountId(accountId string)([]model.BorrowedBook, error){
	borrowedBooks := make([]model.BorrowedBook, 0) 
	query := `SELECT id, group_id, client, account_id, book, status, status_id, accession_id, number, copy_number, penalty, due_date, remarks, is_ebook, created_at FROM borrowed_book_all_view where account_id = $1 and status_id != 6 order by created_at desc`
	err := repo.db.Select(&borrowedBooks, query, accountId)
	return borrowedBooks, err
}

func (repo * Borrowing)GetBorrowedBooksByAccessionId(accessionId string)(model.BorrowedBook, error){
	borrowedBook := model.BorrowedBook{} 
	query := `SELECT id, group_id, client, account_id, book, status, status_id, accession_id, number, copy_number, penalty, due_date, remarks, created_at FROM borrowed_book_view where status_id = 3 and accession_id = $1 order by created_at desc LIMIT 1`
	err := repo.db.Get(&borrowedBook, query, accessionId)
	return borrowedBook, err
}
func (repo * Borrowing)GetBorrowedBooksByAccountIdAndStatusId(accountId string, statusId int)([]model.BorrowedBook, error){
	borrowedBooks := make([]model.BorrowedBook, 0) 
	query := `SELECT id, group_id, client, account_id, book, status, status_id, accession_id, number, copy_number, penalty, due_date, remarks, is_ebook, created_at FROM borrowed_book_all_view where account_id = $1 and status_id = $2 order by created_at desc`
	err := repo.db.Select(&borrowedBooks, query, accountId, statusId)
	return borrowedBooks, err
}
func (repo * Borrowing)GetBorrowedBookById(id string) (model.BorrowedBook, error) {
	book := model.BorrowedBook{}
	err := repo.db.Get(&book, "SELECT group_id, book, client from borrowed_book_all_view where id = $1 LIMIT 1 ", id)
	return book, err
}

func(repo *Borrowing)UpdateRemarks(id string, remarks string) error {
	query := "UPDATE borrowing.borrowed_book SET  remarks = $1 where id = $2"
	_, err := repo.db.Exec(query, remarks , id)
	return err 	
}

func NewBorrowingRepository (db * sqlx.DB)  BorrowingRepository {
	return &Borrowing{
		db: db,
	}
}