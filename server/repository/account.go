package repository

import (
	"database/sql"
	"fmt"
	"mime"
	"mime/multipart"
	"os"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/filestorage"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jaevor/go-nanoid"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type Account struct {
	db *sqlx.DB
	fs filestorage.FileStorage
	
}
type AccountFilter struct {
	Disabled bool `form:"disabled"`
	Active bool `form:"active"`
	Deleted bool `form:"deleted"`
	filter.Filter
}
func (repo *Account) GetAccounts(filter * AccountFilter) ([]model.Account,Metadata, error) {
	var accounts []model.Account = make([]model.Account, 0)
	meta := Metadata{}
	
	dialect := goqu.Dialect("postgres")
	ds := dialect.Select(goqu.C("id"),
		goqu.C("email"), 
		goqu.C("display_name"), 
		goqu.C("is_active"),
		goqu.C("is_deleted"),
		goqu.C("given_name"),
		goqu.C("profile_picture"),
		goqu.C("surname"),
		goqu.C("metadata"),
		goqu.C("program_name"),
		goqu.C("user_type"),
		goqu.C("program"),
		goqu.C("user_group"),
		goqu.C("program_code"),
		goqu.C("student_number"),
	 ).From(goqu.T("account_view"))


	ds = repo.buildAccountFilters(ds, filter)
	ds = ds.Offset(uint(filter.Offset))
	ds = ds.Limit(uint(filter.Limit))
	query, _, err := ds.ToSQL()

	if err != nil {
		
		return accounts,meta, err
	}
	err = repo.db.Select(&accounts,query)
	if err != nil {
		return accounts,meta, err
	}
    query, err = repo.buildMetadataQuery(filter)
	if err != nil {
		return accounts, meta, err	
	}

	
	err = repo.db.Get(&meta, query, filter.Limit)

	if err != nil {
		return accounts,meta, err	
	}
	
	return accounts,meta, nil
}


func (repo * Account)buildAccountFilters(ds * goqu.SelectDataset, filter * AccountFilter)(*goqu.SelectDataset){
	/*
	 	check if active filter or disable filter is enabled
		if both filter are selected, do nothing which fallbacks to default behavior, 
		both active and disabled accounts will be selected.
	 */
	 activeExp := goqu.ExOr{}
	 if(filter.Active && !filter.Disabled){
		activeExp["is_active"] = true
	 }
	
	 if(filter.Disabled && !filter.Active){
		activeExp["is_active"] = false
	 }
	 
	 ds = ds.Where(activeExp)

	 /*
	 	check if deleted filter is selected, 
		if selected, deleted accounts will be fetched.
	 	By default, undeleted account will be fetched.
	 */
	 if (filter.Deleted){
		//only add this expression when all filters are not selected
		if(!filter.Active && !filter.Disabled){
			ds = ds.Where(
				goqu.Ex{"is_deleted": true},
			)
		}
		
	 }else{
		ds = ds.Where(
			goqu.Ex{"is_deleted": false},
		)
	 }

	 return ds
}
func (repo * Account)buildMetadataQuery( filter * AccountFilter)(string, error){
	dialect := goqu.Dialect("postgres")	
	ds := dialect.Select(
		goqu.Case().When(goqu.COUNT(1).Eq(0), 0).Else(goqu.L("Ceil((COUNT(1)/$1::numeric))::bigint")).As("pages"),
		goqu.COUNT(1).As("records"),
	).From(goqu.T("account_view"))
	ds = repo.buildAccountFilters(ds, filter)
	query, _, err := ds.ToSQL()
	return query, err
}

func (repo * Account)buildSearchMetadataQuery(filter * AccountFilter)(string, error){
	dialect := goqu.Dialect("postgres")	
	ds := dialect.Select(
		goqu.Case().When(goqu.COUNT(1).Eq(0), 0).Else(goqu.L("Ceil((COUNT(1)/$1::numeric))::bigint")).As("pages"),
		goqu.COUNT(1).As("records"),
	).From(goqu.T("account_view"))
	ds = ds.Where(
		goqu.L(`	
	   (search_vector @@ (phraseto_tsquery('simple', $2) :: text) :: tsquery  
		OR 
		search_vector @@ (plainto_tsquery('simple', $2)::text) :: tsquery
		OR
		email ILIKE '%' || $2 || '%'
		OR 
		given_name ILIKE '%' || $2 || '%'
		OR
		surname ILIKE'%' || $2 || '%')
	  `),
	)
	ds = repo.buildAccountFilters(ds, filter)
	query, _, err := ds.ToSQL()
	return query, err
}
func (repo *Account) GetAccount(filter * filter.Filter) []model.Account {
	query := `SELECT id, email, display_name, is_active, given_name, profile_picture, surname, metadata FROM account_view where deleted_at is null  ORDER BY surname ASC LIMIT $1 OFFSET $2 `
	var accounts []model.Account = make([]model.Account, 0)

	selectErr := repo.db.Select(&accounts, query, filter.Limit, filter.Offset)
	if selectErr != nil {
		logger.Error(selectErr.Error(), applog.Function("Account.GetAccounts"), applog.Error("selectErr"))
	}
	return accounts
}
func (repo *Account) GetAccountById(id string) (model.Account, error) {
	query := `SELECT id, email, display_name,is_active, given_name, surname, profile_picture, metadata FROM account_view where id = $1 and deleted_at is null and is_active LIMIT 1`
	account := model.Account{}
	err := repo.db.Get(&account, query, id)
	return account, err
}

func (repo *Account) GetAccountByIdDontIgnoreIfDeletedOrInactive(id string) (model.Account, error) {
	query := `SELECT id, email, display_name,is_active, is_deleted, given_name, surname, profile_picture, metadata FROM account_view where id = $1 LIMIT 1`
	account := model.Account{}
	err := repo.db.Get(&account, query, id)
	return account, err
}

func (repo *Account) SearchAccounts(filter * AccountFilter) ([]model.Account,Metadata,error) {
	dialect := goqu.Dialect("postgres")
	ds := dialect.Select(goqu.C("id"),
		goqu.C("email"), 
		goqu.C("display_name"), 
		goqu.C("is_active"),
		goqu.C("is_deleted"),
		goqu.C("given_name"),
		goqu.C("profile_picture"),
		goqu.C("surname"),
		goqu.C("metadata"),
		goqu.C("program_name"),
		goqu.C("program_code"),
		goqu.C("user_type"),
		goqu.C("student_number"),
	).From(goqu.T("account_view"))
	
	ds = ds.Where(
		goqu.L(`	
	   (search_vector @@ (phraseto_tsquery('simple', $1) :: text) :: tsquery  
		OR 
		search_vector @@ (plainto_tsquery('simple', $1)::text) :: tsquery
		OR
		email ILIKE '%' || $1 || '%'
		OR 
		given_name ILIKE '%' || $1 || '%'
		OR
		surname ILIKE'%' || $1 || '%')
	  `),
	)
	
	ds = repo.buildAccountFilters(ds, filter)
	var accounts []model.Account = make([]model.Account, 0)
	metadata := Metadata{}

	ds = ds.Offset(uint(filter.Offset)).Limit(uint(filter.Limit))
	query,_ , err := ds.ToSQL()
	
	if err != nil {	
		return accounts, metadata, err 
	}
	err = repo.db.Select(&accounts, query, filter.Keyword)
	if err != nil {
		return accounts, metadata, err 
	}

	query, err = repo.buildSearchMetadataQuery(filter)
	if err != nil {
		return accounts, metadata, err 
	}

	err = repo.db.Get(&metadata, query, filter.Limit, filter.Keyword)
	if err != nil {
		return accounts, metadata, err
	}
	
	return accounts, metadata, nil
}


func (repo *Account) NewAccounts(accounts *[]model.Account) error {
	var accountRows []goqu.Record = make([]goqu.Record, 0)
	dialect := goqu.Dialect("postgres")
	for _, account := range *accounts {
		accountRows = append(accountRows, goqu.Record{"id": account.Id,
			"display_name": account.DisplayName, "surname": account.Surname, "given_name": account.GivenName, "email": account.Email})
	}
	accountDs := dialect.From("system.account").
		Prepared(true).Insert().Rows(accountRows).
		OnConflict(
			exp.NewDoUpdateConflictExpression("id", goqu.Record{"id": goqu.L("EXCLUDED.id"),
				"display_name": goqu.L("EXCLUDED.display_name"), "surname": goqu.L("EXCLUDED.surname"),
				"given_name": goqu.L("EXCLUDED.given_name"), "email": goqu.L("EXCLUDED.email")}))
	query, args, toQueryErr := accountDs.ToSQL()
	if toQueryErr != nil {
		logger.Error(toQueryErr.Error(), applog.Function("Account.NewAccounts"))
		return toQueryErr
	}

	insertResult, insertErr := repo.db.Exec(query, args...)
	if insertErr != nil {
		logger.Error(insertErr.Error(), applog.Function("Account.NewAccounts"))
		
		return insertErr
	}
	accountsInserted, _ := insertResult.RowsAffected()

	logger.Info("New accounts created.", applog.AffectedRows(accountsInserted))

	return nil
}
func (repo *Account) VerifyAndUpdateAccount(account model.Account) error {

	registeredAccount := model.Account{}
	getErr := repo.db.Get(&registeredAccount, "Select id, display_name, email, surname, given_name, updated_at from system.account where id = $1 or email = $2", account.Id, account.Email)
	if getErr != nil {
		if getErr == sql.ErrNoRows {
				logger.Info("User doesn't not exist inserting in database.")
			_, insertErr := repo.db.Exec("Insert into system.account(id, display_name, email, surname, given_name) VALUES ($1, $2, $3, $4, $5)",
				account.Id, account.DisplayName, account.Email, account.Surname, account.GivenName)
			if insertErr != nil {
				logger.Error(insertErr.Error(), applog.Function("Account.VerifyAndUpdateAccount"), applog.Error("insertErr"))
				return insertErr
			}
			logger.Info("Inserting user account.", zap.String("accountId", account.Id), applog.Function("Account.VerifyAndUpdateAccount"))
			
			return nil
		}
	
		logger.Error(getErr.Error(), applog.Function("Account.VerifyAndUpdateAccount"), applog.Error("getErr"))
		return getErr
	}
	OneMonth := time.Hour * 730

	if len(registeredAccount.Id) > 0 {
		if time.Now().Equal(registeredAccount.UpdatedAt.Time.Add(OneMonth)) || time.Now().After(registeredAccount.UpdatedAt.Add(OneMonth)) {
			_, updateErr := repo.db.Exec("Update system.account set display_name = $1, email = $2, surname = $3, given_name = $4, updated_at = now() where id = $5 or email = $2",
				account.DisplayName, account.Email, account.Surname, account.GivenName, account.Id)
			if updateErr != nil {
				logger.Error(updateErr.Error(), applog.Function("Account.VerifyAndUpdateAccount"), applog.Error("updateErr"))
				
				return updateErr
			}
			logger.Info("Updating user account.", zap.String("accountId", registeredAccount.Id), applog.Function("Account.VerifyAndUpdateAccount"))
		}

	}
	return nil
}
func (repo *Account) GetRoleByAccountId(accountId string) (model.Role, error) {

	role := model.Role{}
	query := `SELECT COALESCE(role.id, 0) as id, COALESCE(role.name,'') as name,  COALESCE(ARRAY_AGG(role_permission.value),'{}') as permissions from system.account as ac
		LEFT JOIN system.account_role as ar on ac.id = ar.account_id
		LEFT JOIN system.role on ar.role_id = role.id
		LEFT JOIN system.role_permission on role.id  = role_permission.role_id
		where ac.id = $1 GROUP BY role.id, ac.id`

	getErr := repo.db.Get(&role, query, accountId)
	if getErr != nil {
		logger.Error(getErr.Error(), applog.Function("Account.GetRoleByAccountId"), applog.Error("getErr"))
	}
	return role, getErr
}
func(repo * Account) GetAccountsWithAssignedRoles()model.AccountRoles{

	accountRoles := make(model.AccountRoles, 0)
	query := `SELECT account.json_format as account,
	json_build_object(
	  'id', role.id,
	  'name', role.name,
	  'permissions', COALESCE(ARRAY_AGG(role_permission.value),'{}')
	) as role
   from system.account_role
   INNER JOIN account_view as account on account_role.account_id = account.id
   INNER JOIN system.role on account_role.role_id = role.id
   INNER JOIN system.role_permission on role.id  = role_permission.role_id GROUP BY account.id, account_role.id, role.id, account.json_format`

	selectErr := repo.db.Select(&accountRoles, query)
	if selectErr != nil{
		logger.Error(selectErr.Error(), applog.Function("Account.GetRoles"), applog.Error("getErr"))
		
	}
	return accountRoles
}
func (repo * Account) UpdateProfilePictureById(id string, image * multipart.FileHeader) error {
	
	fileBuffer, err := image.Open()
	if err != nil {
		return err
	}
	defer fileBuffer.Close()
	contentType := image.Header["Content-Type"][0]
	if contentType != "image/jpeg" && contentType != "image/jpg" && contentType != "image/png" && contentType != "image/webp"{
		return fmt.Errorf("content type not supported : %s ", contentType)
	}
	canonicID, nanoIdErr := nanoid.Standard(21)
	if nanoIdErr != nil {
		return nanoIdErr
	}
	ext, err  := mime.ExtensionsByType(contentType)
	if err != nil {
		return err
	}
	if ext == nil {
		return fmt.Errorf("no extension for specificied content type")
	}
	objectName := fmt.Sprintf("profile-pictures/%s%s", canonicID(), ext[0])
	defaultBucket := os.Getenv("S3_DEFAULT_BUCKET")
	
	key, err := repo.fs.NewUploader(objectName, defaultBucket, fileBuffer).SetContentType(contentType).Upload()
	
	if err != nil {
		return err
	}
	transaction, err := repo.db.Beginx()
	if err != nil {
		transaction.Rollback()
		return err
	}
	dbAccount := model.Account{}
	err = transaction.Get(&dbAccount, "SELECT profile_picture from account_view where id = $1 limit 1", id)
	if err != nil {
		transaction.Rollback()
		return err
	}
	if len(dbAccount.ProfilePicture) > 0 {
		err := repo.fs.Delete(dbAccount.ProfilePicture, defaultBucket)
		if err != nil {
			 transaction.Rollback()
			 return err
		}
	}
	_, err = transaction.Exec("UPDATE system.account set profile_picture = $1 where id = $2", key, id)
	if err != nil {
		transaction.Rollback()
		return err
	}
	transaction.Commit()
	return nil
}


func(repo * Account)DisableAccounts(accountIds []string) error {
	dialect := goqu.Dialect("postgres")
	if len(accountIds) == 0 {
		return nil
	}
	ds := dialect.Update(goqu.T("account").Schema("system"))
	ds = ds.Set(goqu.Record{"active_since": goqu.L("null")})
	ds = ds.Where(goqu.ExOr{
		"id" : accountIds,
	}).Prepared(true)
	query, args, err := ds.ToSQL()
	if err != nil {
		return err
	}
	_, err = repo.db.Exec(query, args...)
	
	return err
}
func(repo * Account)GetAccountByStudentNumberOrEmail(input string)(model.Account, error){
	query := `SELECT id, email, display_name,is_active, given_name, surname, profile_picture, metadata FROM account_view where (lower(email) = lower($1) OR lower(student_number) = lower($1)) and deleted_at is null and is_active LIMIT 1`
	account := model.Account{}
	err := repo.db.Get(&account, query, input)
	return account, err
}
func(repo * Account)DeleteAccounts(accountIds []string) error {
	dialect := goqu.Dialect("postgres")
	if len(accountIds) == 0 {
		return nil
	}
	ds := dialect.Update(goqu.T("account").Schema("system"))
	ds = ds.Set(goqu.Record{"deleted_at": goqu.L("now()"), "active_since": goqu.L("null")})
	ds = ds.Where(goqu.ExOr{
		"id" : accountIds,
	}).Prepared(true)
	query, args, err := ds.ToSQL()
	if err != nil {
		return err
	}
	_, err = repo.db.Exec(query, args...)
	
	return err
}

func(repo * Account)RestoreAccounts(accountIds []string) error {
	dialect := goqu.Dialect("postgres")
	if len(accountIds) == 0 {
		return nil
	}
	ds := dialect.Update(goqu.T("account").Schema("system"))
	ds = ds.Set(goqu.Record{"deleted_at": goqu.L("null")})
	ds = ds.Where(goqu.ExOr{
		"id" : accountIds,
	}).Prepared(true)
	query, args, err := ds.ToSQL()
	if err != nil {
		return err
	}
	_, err = repo.db.Exec(query, args...)
	return err
}

func (repo * Account) GetAccountStatsById(accountId string)(model.AccountStats, error ){
	accountStats := model.AccountStats{}
	query := `
	SELECT  account.max_allowed_borrowed_books, account.max_unique_device_reservation_per_day, 
	COUNT(bbv.id) FILTER(where is_ebook = false)  +
	COUNT(bbv.id) FILTER (where is_ebook = true and (due_date is null OR current_date AT TIME ZONE 'PHT' <= due_date))  as total_borrowed_books,
	(
	COUNT(bbv.id) FILTER(where is_ebook = false)  +
	COUNT(bbv.id) FILTER (where is_ebook = true and (due_date is null OR current_date AT TIME ZONE 'PHT' <= due_date))
	) < account.max_allowed_borrowed_books as is_allowed_to_borrow
	FROM account_view as account
	LEFT JOIN borrowed_book_all_view as bbv on account.id = bbv.account_id 
	and (bbv.status_id = 1 or bbv.status_id = 2 or bbv.status_id = 3)
	where account.id = $1
	GROUP BY account.id, account.max_allowed_borrowed_books,account.max_unique_device_reservation_per_day
	`
	err := repo.db.Get(&accountStats, query, accountId )
	return accountStats, err
}



func NewAccountRepository(db *sqlx.DB, fs filestorage.FileStorage) AccountRepository {
	return &Account{
		db:db,
		fs: fs,
		
	}
}

type AccountRepository interface {
	GetAccounts( * AccountFilter) ([]model.Account,Metadata ,error)
	SearchAccounts(* AccountFilter) ([]model.Account, Metadata, error)
	NewAccounts(accounts *[]model.Account) error
	VerifyAndUpdateAccount(account model.Account) error
	GetRoleByAccountId(accountId string) (model.Role, error)
	GetAccountsWithAssignedRoles() model.AccountRoles
	GetAccountById(id string) (model.Account, error)
	UpdateProfilePictureById(id string, image * multipart.FileHeader) error
	DeleteAccounts(accountIds []string) error 
	DisableAccounts(accountIds []string) error
	GetAccountByIdDontIgnoreIfDeletedOrInactive(id string) (model.Account, error)
	RestoreAccounts(accountIds []string) error
	ActivateAccountBulk(accounts []model.AccountActivation) error 
	ActivateAccounts(accountIds []string,  userTypeId int, programId int, activeUntil string, studentNumber string) error
	DeactiveAccounts(accountIds []string) error
	GetAccountStatsById(accountId string)(model.AccountStats, error )
	GetAccountByStudentNumberOrEmail(input string)(model.Account, error)
}
