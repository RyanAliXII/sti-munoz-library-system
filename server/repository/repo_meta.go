package repository

import (
	"fmt"

	"github.com/jmoiron/sqlx"
)

func GetParanoidRepositoryMetadataTx(transaction * sqlx.Tx,tableName string , rowsLimit int)(Metadata, error){
		meta := Metadata{}
        query := fmt.Sprintf("SELECT CASE WHEN COUNT(*) = 0 then 0 else CEIL((COUNT(*)/$1::numeric))::bigint end as pages, count(*) as records FROM %s where deleted_at is null", tableName )
		getMetaErr := transaction.Get(&meta, query, rowsLimit)
		return meta, getMetaErr
}