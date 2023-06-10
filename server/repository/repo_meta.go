package repository

import (
	"fmt"

	"github.com/jmoiron/sqlx"
)

func GetRepositoryMetadataTx(transaction * sqlx.Tx,tableName string ,pageOffset int){

        query := fmt.Sprintf("SELECT COUNT(*)  FROM %s", tableName )
		fmt.Println(query)
}