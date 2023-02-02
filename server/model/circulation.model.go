package model

import "slim-app/server/app/db"

type BorrowingTransaction struct {
	Id                 string          `json:"id" db:"id"`
	AccountDisplayName string          `json:"displayName" db:"display_name"`
	AccountId          string          `json:"accountId" db:"account_id"`
	CreatedAt          db.NullableTime `json:"createdAt" db:"created_at"`
}
