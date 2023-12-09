package repository

import (
	"context"
	"fmt"
	"mime/multipart"
	"path/filepath"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/objstore"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/jaevor/go-nanoid"
	"github.com/jmoiron/sqlx"
	"github.com/minio/minio-go/v7"
)

type PenaltyRepository struct {
	db *sqlx.DB
	objstore * minio.Client
}


func NewPenaltyRepository() PenaltyRepositoryInterface{
	return &PenaltyRepository{
		db: postgresdb.GetOrCreateInstance(),
		objstore: objstore.GetorCreateInstance(),
	}

}

func(repo * PenaltyRepository) GetPenalties()[]model.Penalty{

	penalties := make([]model.Penalty, 0)
	query := `
	SELECT penalty.id, 
	description,account_id, 
	to_char(penalty.created_at, 'YYYYMMDDHH24MISS') as reference_number,
	item, amount,settled_at,
	proof,
	remarks,
	 penalty.created_at, account.json_format as account,
		(case when settled_at is not null then true else false end) as is_settled
		FROM borrowing.penalty inner join account_view as account on penalty.account_id = account.id
		ORDER BY created_at DESC`
	
	selectErr := repo.db.Select(&penalties, query)
	if selectErr != nil {
		logger.Error(selectErr.Error(),slimlog.Function("PenaltyRepository.GetPenalties") ,slimlog.Error("selectErr"))
	}

	return penalties
}
func (repo * PenaltyRepository)UpdatePenaltySettlement(id string, isSettle bool) error{
	settleQuery  := `
		Update borrowing.penalty SET settled_at = NOW() where id  = $1
	`
	unSettleQuery := `
	Update borrowing.penalty SET settled_at = null where id  = $1
	`

	if(isSettle){
		_,settleErr := repo.db.Exec(settleQuery, id)
		if settleErr != nil {
			logger.Error(settleErr.Error(), slimlog.Function("PenaltyRepository.UpdatePenaltySettlement") , slimlog.Error("settleErr"))
			return settleErr
		}


	}else{
		_,unSettleErr := repo.db.Exec(unSettleQuery, id)
        if unSettleErr!= nil {
            logger.Error(unSettleErr.Error(), slimlog.Function("PenaltyRepository.UpdatePenaltySettlement"), slimlog.Error("unSettleErr"))
            return unSettleErr
        }
	}

	return nil
}

func (repo * PenaltyRepository)MarkAsSettled(id string, fileHeader * multipart.FileHeader, remarks string) error {
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
		logger.Error(nanoIdErr.Error(), slimlog.Function("BookRepository.UploadBookCover"), slimlog.Error("nanoIdErr"))
		return nanoIdErr
	}
	proof, err := fileHeader.Open()
	if err != nil {
		return err
	}
	defer proof.Close()
	fileExt := filepath.Ext(fileHeader.Filename) 
	objectName := fmt.Sprintf("payment-proof/%s%s", canonicID(), fileExt)
	size := fileHeader.Size
	contentType := fileHeader.Header["Content-Type"][0]
	uploadInfo, err := repo.objstore.PutObject(context.Background(), objstore.BUCKET,objectName, proof, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return err
	}
	fmt.Println(id)
	_, err = repo.db.Exec("UPDATE borrowing.penalty SET settled_at = now(), proof = $1, remarks = $2 where id = $3", uploadInfo.Key,remarks, id)
	if err != nil {
		return err	
	}
	return nil
}

func (repo * PenaltyRepository)UpdateSettlement(id string, fileHeader * multipart.FileHeader, remarks string) error {
	
	penalty := model.Penalty{}
	err := repo.db.Get(&penalty, "SELECT id, proof FROM borrowing.penalty where id = $1 and settled_at is not null", id)
	if err != nil {
		return err
	}
	err = repo.objstore.RemoveObject(context.Background(), objstore.BUCKET, penalty.Proof, minio.RemoveObjectOptions{})
	if err != nil {
		return err
	}
	canonicID, nanoIdErr := nanoid.Standard(21)
	if nanoIdErr != nil {
		logger.Error(nanoIdErr.Error(), slimlog.Function("BookRepository.UploadBookCover"), slimlog.Error("nanoIdErr"))
		return nanoIdErr
	}
	proof, err := fileHeader.Open()
	if err != nil {
		return err
	}
	defer proof.Close()
	fileExt := filepath.Ext(fileHeader.Filename) 
	objectName := fmt.Sprintf("payment-proof/%s%s", canonicID(), fileExt)
	size := fileHeader.Size
	contentType := fileHeader.Header["Content-Type"][0]
	uploadInfo, err := repo.objstore.PutObject(context.Background(), objstore.BUCKET,objectName, proof, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return err
	}
	fmt.Println(id)
	_, err = repo.db.Exec("UPDATE borrowing.penalty SET settled_at = now(), proof = $1, remarks = $2 where id = $3", uploadInfo.Key,remarks, id)
	if err != nil {
		return err	
	}
	return nil
}
func (repo * PenaltyRepository) AddPenalty(penalty model.Penalty ) error {
	query := `
    INSERT INTO borrowing.penalty (description, account_id, amount, item) VALUES ($1, $2, $3, $4)
    `
    _,insertErr := repo.db.Exec(query, penalty.Description, penalty.AccountId, penalty.Amount, penalty.Item)
    if insertErr != nil {
        logger.Error(insertErr.Error(), slimlog.Function("PenaltyRepository.AddPenalty"), slimlog.Error("inserErr"))
        return insertErr
    }
	return nil
}
func (repo * PenaltyRepository) UpdatePenalty(penalty model.Penalty) error {
	query := `
   		 UPDATE borrowing.penalty SET description = $1, account_id = $2, amount = $3, item = $4  where id = $5`
    _,updateErr := repo.db.Exec(query, penalty.Description, penalty.AccountId, penalty.Amount, penalty.Item, penalty.Id)
    if updateErr != nil {
        logger.Error(updateErr.Error(), slimlog.Function("PenaltyRepository.UpdatePenalty"), slimlog.Error("updateErr"))
        return updateErr
    }
	return nil
}


type PenaltyRepositoryInterface interface{
	GetPenalties()[]model.Penalty
	UpdatePenaltySettlement(id string, isSettle bool) error
	AddPenalty(penalty model.Penalty ) error
	UpdatePenalty(penalty model.Penalty ) error
	MarkAsSettled(id string, fileHeader * multipart.FileHeader, remarks string) error
	UpdateSettlement(id string, fileHeader * multipart.FileHeader, remarks string) error
}
