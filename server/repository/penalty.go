package repository

import (
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/filestorage"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/jaevor/go-nanoid"
	"github.com/jmoiron/sqlx"
)

type Penalty struct {
	db *sqlx.DB
	fs  filestorage.FileStorage
}
type PenaltyFilter struct {
	From string 
	To string 
	Min float64
	Max float64 
	Status string 
	SortBy string 
	Order string 
	filter.Filter
}
func NewPenaltyRepository(db * sqlx.DB, fileStorage  filestorage.FileStorage) PenaltyRepository{
	return &Penalty{
		db: db,
		fs: fileStorage,
	
	}
}
func(repo *Penalty) GetPenalties(filter * PenaltyFilter)([]model.Penalty, Metadata, error){
	penalties := make([]model.Penalty, 0)
	metadata := Metadata{}
	dialect := goqu.Dialect("postgres")
	ds := dialect.From(goqu.T("penalty_view").As("penalty")).Select(
		goqu.C("id").Table("penalty"),
		goqu.C("description"),
		goqu.C("account_id"),
		goqu.C("reference_number"),
		goqu.C("item"),
		goqu.C("amount"),
		goqu.C("settled_at"),
		goqu.C("proof"),
		goqu.C("remarks"),
		goqu.C("classification"),
		goqu.C("class_id"),
		goqu.C("created_at").Table("penalty"),
		goqu.C("account"),
		goqu.C("is_settled"),
	).Prepared(true)
	ds = repo.buildPenaltyFilters(ds, filter)
	ds = repo.buildSortOrder(ds, filter)
	ds = ds.Limit(uint(filter.Limit)).
	Offset(uint(filter.Offset))
	query, args , err := ds.ToSQL()
	if err != nil {
		return penalties, metadata, err
	} 
	err = repo.db.Select(&penalties, query, args...)
	if err != nil {
		return penalties, metadata, err
	}

	ds = repo.buildMetadataQuery(filter)
	query, args, err = ds.ToSQL()
	if err != nil {
		return penalties, metadata, err
	}
	err = repo.db.Get(&metadata, query, args...)
	if err != nil {
		return penalties, metadata, err
	}
	return penalties, metadata, nil
}

func(repo *Penalty) GetPenaltiesByAccountId(accountId string)([]model.Penalty, error){
	penalties := make([]model.Penalty, 0)
	dialect := goqu.Dialect("postgres")
	ds := dialect.From(goqu.T("penalty_view").As("penalty")).Select(
		goqu.C("id").Table("penalty"),
		goqu.C("description"),
		goqu.C("account_id"),
		goqu.C("reference_number"),
		goqu.C("item"),
		goqu.C("amount"),
		goqu.C("settled_at"),
		goqu.C("proof"),
		goqu.C("remarks"),
		goqu.C("classification"),
		goqu.C("class_id"),
		goqu.C("created_at").Table("penalty"),
		goqu.C("account"),
		goqu.C("is_settled"),
	).Prepared(true).Where(goqu.Ex{
		"account_id" : accountId,
	})
	query, args , err := ds.ToSQL()
	if err != nil {
		return penalties, err
	} 
	err = repo.db.Select(&penalties, query, args...)
	if err != nil {
		return penalties,  err
	}
	return penalties, nil
}
func(repo * Penalty) buildPenaltyFilters(ds * goqu.SelectDataset,  filter * PenaltyFilter) *goqu.SelectDataset{
	if(len(filter.From) > 0  && len(filter.To) > 0){
		ds = ds.Where(
			goqu.L("date(created_at at time zone 'PHT')").Between(goqu.Range(filter.From, filter.To)),
		) 
	}
	if(len(filter.Keyword) > 0){
		keyword := filter.Filter.Keyword
		ds = ds.Where(
			goqu.L(`	
		   (account->>'searchVector' @@ (phraseto_tsquery('simple', ?) :: text) :: tsquery  
			OR 
			account->>'searchVector' @@ (plainto_tsquery('simple', ?)::text) :: tsquery
			OR
			account->>'email' ILIKE '%' || ? || '%'
			OR 
			account->>'givenName' ILIKE '%' || ? || '%'
			OR
			account->>'surname' ILIKE'%' || ? || '%')
		  `, keyword, keyword, keyword, keyword, keyword ),
		)
	}
	if(filter.Min > 0 && filter.Max > 0){
		ds = ds.Where(
			goqu.L("amount").Between(goqu.Range(filter.Min, filter.Max)),
		) 
	}
	if(filter.Min > 0){
		ds = ds.Where(
			goqu.L("amount").Gte(filter.Min)) 
	}
	if(filter.Max > 0){
		ds = ds.Where(
			goqu.L("amount").Lte(filter.Max)) 
	}
	if filter.Status == "settled"{
		ds = ds.Where(goqu.Ex{
			"is_settled":true,
		})
	}
	if filter.Status == "unsettled"{
		ds = ds.Where(goqu.Ex{
			"is_settled":false,
		})
	}	
	return ds
}
func (repo * Penalty)buildMetadataQuery(filter * PenaltyFilter) (*goqu.SelectDataset){
	dialect := goqu.Dialect("postgres")	
	ds := dialect.Select(
		goqu.Case().When(goqu.COUNT(1).Eq(0), 0).Else(goqu.L("Ceil((COUNT(1)/?::numeric))::bigint", filter.Limit)).As("pages"),
		goqu.COUNT(1).As("records"),
	).From(goqu.T("penalty_view"))
	ds = repo.buildPenaltyFilters(ds, filter)
	return ds
}
func(repo * Penalty)buildSortOrder(ds * goqu.SelectDataset, filter * PenaltyFilter)(*goqu.SelectDataset){
	SortByColumnMap := map[string]string{
			"givenName": "account.given_name",
			"surname": "account.surname",
			"dateCreated": "created_at",
			"amount": "amount",
	}
	column, exists := SortByColumnMap[filter.SortBy]
	if(exists){
		if(filter.Order == "asc"){
			return ds.Order(exp.NewOrderedExpression(goqu.I(column), exp.AscDir, exp.NullsLastSortType))
		}
		if(filter.Order == "desc"){
			return ds.Order(exp.NewOrderedExpression(goqu.I(column), exp.DescSortDir, exp.NullsLastSortType))
		}
	}
	return ds.Order(exp.NewOrderedExpression(goqu.L("created_at"), exp.DescSortDir, exp.NoNullsSortType))
}
func(repo * Penalty)GetPenaltyById(id string)(model.Penalty, error){
	penalty := model.Penalty{}
	query := `
	SELECT penalty.id, 
	description,account_id, 
	reference_number,
	item, amount,settled_at,
	proof,
	remarks,
	classification,
	class_id,
	penalty.created_at, account,
	is_settled
	FROM penalty_view as penalty inner join account_view as account on penalty.account_id = account.id
	where penalty.id = $1
	ORDER BY created_at DESC`
	err := repo.db.Get(&penalty, query, id)
	if  err != nil {
		return penalty,err
	}
	return penalty, err
	
}

func(repo * Penalty)GetPenaltyByIdAndAccountId(id string, accountId string)(model.Penalty, error){
	penalty := model.Penalty{}
	query := `
	SELECT penalty.id, 
	description,account_id, 
	reference_number,
	item, amount,settled_at,
	proof,
	remarks,
	classification,
	class_id,
	penalty.created_at, account,
	is_settled
	FROM penalty_view as penalty inner join account_view as account on penalty.account_id = account.id
	where penalty.id = $1 and account_id = $2
	ORDER BY created_at DESC`
	err := repo.db.Get(&penalty, query, id, accountId)
	if  err != nil {
		return penalty,err
	}
	return penalty, err
	
}
func (repo *Penalty)UpdatePenaltySettlement(id string, isSettle bool) error{
	settleQuery  := `
		Update borrowing.penalty SET settled_at = NOW() where id  = $1
	`
	unSettleQuery := `
	Update borrowing.penalty SET settled_at = null where id  = $1
	`

	if(isSettle){
		_,settleErr := repo.db.Exec(settleQuery, id)
		if settleErr != nil {
			logger.Error(settleErr.Error(), applog.Function("PenaltyRepository.UpdatePenaltySettlement") , applog.Error("settleErr"))
			return settleErr
		}
	}else{
		_,unSettleErr := repo.db.Exec(unSettleQuery, id)
        if unSettleErr!= nil {
            logger.Error(unSettleErr.Error(), applog.Function("PenaltyRepository.UpdatePenaltySettlement"), applog.Error("unSettleErr"))
            return unSettleErr
        }
	}

	return nil
}

func (repo *Penalty)MarkAsSettled(id string, fileHeader * multipart.FileHeader, remarks string) error {
	isSettled := true

	err := repo.db.Get(&isSettled, "SELECT EXISTS (SELECT * FROM borrowing.penalty where id = '18c37381-613a-493c-98c5-c6c6274f06ac' and settled_at is null)")
	if err != nil {
		return err
	}
	if isSettled {
		return nil
	}
	canonicID, nanoIdErr := nanoid.Standard(21)
	if nanoIdErr != nil {
		logger.Error(nanoIdErr.Error(), applog.Function("BookRepository.UploadBookCover"), applog.Error("nanoIdErr"))
		return nanoIdErr
	}
	proof, err := fileHeader.Open()
	if err != nil {
		return err
	}
	defer proof.Close()
	contentType := fileHeader.Header["Content-Type"][0]
	if contentType != "image/jpeg" && contentType != "image/jpg" && contentType != "image/png" && contentType != "image/webp"{
		return fmt.Errorf("content type not supported : %s ", contentType)
	}
	fileExt := filepath.Ext(fileHeader.Filename) 
	objectName := fmt.Sprintf("payment-proof/%s%s", canonicID(), fileExt)
	bucket := os.Getenv("S3_DEFAULT_BUCKET")
    key, err := repo.fs.NewUploader(objectName, bucket, proof ).SetContentType(contentType).Upload()
	if err != nil {
		return err
	}
	_, err = repo.db.Exec("UPDATE borrowing.penalty SET settled_at = now(), proof = $1, remarks = $2 where id = $3",key,remarks, id)
	if err != nil {
		err := repo.fs.Delete(objectName, bucket)
		if err != nil {
			return err
		}
		return err	
	}
	return nil
}

func (repo *Penalty)UpdateSettlement(id string, fileHeader * multipart.FileHeader, remarks string) error {
	
	penalty := model.Penalty{}
	err := repo.db.Get(&penalty, "SELECT id, proof FROM borrowing.penalty where id = $1 and settled_at is not null", id)
	if err != nil {
		return err
	}
	bucket := os.Getenv("S3_DEFAULT_BUCKET")
	err = repo.fs.Delete(penalty.Proof, bucket)
	if err != nil {
		return err
	}
	canonicID, nanoIdErr := nanoid.Standard(21)
	if nanoIdErr != nil {
		logger.Error(nanoIdErr.Error(), applog.Function("BookRepository.UploadBookCover"), applog.Error("nanoIdErr"))
		return nanoIdErr
	}
	proof, err := fileHeader.Open()
	if err != nil {
		return err
	}
	defer proof.Close()
	contentType := fileHeader.Header["Content-Type"][0]
	if contentType != "image/jpeg" && contentType != "image/jpg" && contentType != "image/png" && contentType != "image/webp"{
		return fmt.Errorf("content type not supported : %s ", contentType)
	}
	fileExt := filepath.Ext(fileHeader.Filename) 
	objectName := fmt.Sprintf("payment-proof/%s%s", canonicID(), fileExt)

	key, err := repo.fs.NewUploader(objectName, bucket, proof).SetContentType(contentType).Upload()
	if err != nil {
		return err
	}
	_, err = repo.db.Exec("UPDATE borrowing.penalty SET settled_at = now(), proof = $1, remarks = $2 where id = $3", key,remarks, id)
	if err != nil {
		err := repo.fs.Delete(objectName, bucket)
		if err != nil {
			return err
		}
		return err	
	}
	return nil
}
func (repo *Penalty) AddPenalty(penalty model.Penalty ) (string, error) {
	query := `
    INSERT INTO borrowing.penalty (description, account_id, amount, item) VALUES ($1, $2, $3, $4) RETURNING id
    `
	id := ""
	if(len(penalty.ClassId) > 0){
		query = `INSERT INTO borrowing.penalty (account_id, item, class_id) VALUES ($1, $2, $3) RETURNING id`
		insertErr := repo.db.Get(&id,query, penalty.AccountId, penalty.Item, penalty.ClassId)
		if insertErr != nil {
			logger.Error(insertErr.Error(), applog.Function("PenaltyRepository.AddPenalty"), applog.Error("inserErr"))
			return id, insertErr
		}
		return id, nil
	}
    insertErr := repo.db.Get(&id,query, penalty.Description, penalty.AccountId, penalty.Amount, penalty.Item)
    if insertErr != nil {
        logger.Error(insertErr.Error(), applog.Function("PenaltyRepository.AddPenalty"), applog.Error("inserErr"))
        return id, insertErr
    }
	
	return id, nil
}
func (repo *Penalty)UpdatePenalty(penalty model.Penalty) error {
	query := `
   		 UPDATE borrowing.penalty SET description = $1, account_id = $2, amount = $3, item = $4, class_id = null  where id = $5`
	
	if(penalty.ClassId != "00000000-0000-0000-0000-000000000000"){
		query = `
		UPDATE borrowing.penalty SET description = $1, account_id = $2, amount = $3, item = $4, class_id= $5  where id = $6`
		_,updateErr := repo.db.Exec(query, "", penalty.AccountId, 0, penalty.Item,penalty.ClassId, penalty.Id )
		if updateErr != nil {
			logger.Error(updateErr.Error(), applog.Function("PenaltyRepository.UpdatePenalty"), applog.Error("updateErr"))
			return updateErr
		}
		return nil
	}
    _,updateErr := repo.db.Exec(query, penalty.Description, penalty.AccountId, penalty.Amount, penalty.Item, penalty.Id)
    if updateErr != nil {
        logger.Error(updateErr.Error(), applog.Function("PenaltyRepository.UpdatePenalty"), applog.Error("updateErr"))
        return updateErr
    }
	return nil
}

func(repo * Penalty) buildExportQuery(filter * PenaltyFilter)(string, []interface{}, error){
	dialect := goqu.Dialect("postgres")
	ds := dialect.From(goqu.T("penalty_view").As("penalty")).Select(
		goqu.C("description"),
		goqu.C("reference_number"),
		goqu.C("item"),
		goqu.C("amount"),
		goqu.C("remarks"),
		goqu.C("created_at").Table("penalty"),
		goqu.L("CONCAT(account->>'givenName', ' ', account->>'surname')").As("name"),
		goqu.L("account->>'studentNumber'").As("student_number"),
		goqu.L("account->>'userType'").As("user_type"),
		goqu.L("account->>'programCode'").As("program_code"),
		goqu.C("is_settled"),
	).Prepared(true)
	ds = repo.buildPenaltyFilters(ds, filter)
	ds = repo.buildSortOrder(ds, filter)
	return ds.ToSQL()
}
func(repo *Penalty)GetPenaltyCSVData(filter * PenaltyFilter)([]model.PenaltyExport, error) {
	data := make([]model.PenaltyExport, 0)
	query, args, err := repo.buildExportQuery(filter)
	if err != nil {
		return data, err
	}
	err = repo.db.Select(&data, query, args...)
	if err != nil {
		return data, err
	}
	return data, nil
}
func(repo *Penalty)GetPenaltyExcelData(filter * PenaltyFilter)([]map[string]interface{}, error){
	results := []map[string]interface{}{}
	query, args, err := repo.buildExportQuery(filter)
	if err != nil {
		return results, err
	}
	rows, err := repo.db.Queryx(query, args...)
	if err != nil {
		return results, err
	}
	defer rows.Close()

	for rows.Next() {
		// Create a map to store the result of each row
		result := make(map[string]interface{})

		// Use MapScan to map the columns to the map
		err := rows.MapScan(result)
		if err != nil {
			return results, err
		}
	
		results = append(results, result)
	}
	return results, nil
}
type PenaltyRepository interface{
	GetPenalties(filter * PenaltyFilter)([]model.Penalty, Metadata, error)
	UpdatePenaltySettlement(id string, isSettle bool) error
	AddPenalty(penalty model.Penalty ) (string, error)
	UpdatePenalty(penalty model.Penalty ) error
	MarkAsSettled(id string, fileHeader * multipart.FileHeader, remarks string) error
	UpdateSettlement(id string, fileHeader * multipart.FileHeader, remarks string) error
	NewPenaltyClassification (class model.PenaltyClassification)(error)
	GetPenaltyClassifications()([]model.PenaltyClassification, error)
	UpdatePenaltyClassification (class model.PenaltyClassification)(error)
	DeletePenaltyClassification(id string) error 
	GetPenaltyById(id string)(model.Penalty, error)
	GetPenaltyCSVData(filter * PenaltyFilter)([]model.PenaltyExport, error) 
	GetPenaltyExcelData(filter * PenaltyFilter)([]map[string]interface{}, error)
	GetPenaltiesByAccountId(id string)([]model.Penalty, error)
	GetPenaltyByIdAndAccountId(id string, accountId string)(model.Penalty, error) 
	
}
