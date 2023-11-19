package model

import "github.com/RyanAliXII/sti-munoz-library-system/server/app/db"

type BorrowingQueue struct {
	Id string `json:"id" db:"id"`
	BookId string `json:"bookId" db:"book_id"`
	AccountId string `json:"accountId" db:"account_id"`
	Book BookJSON `json:"book" db:"book"`
	Items int `json:"items" db:"items"`
	CreatedAt db.NullableTime `json:"createdAt" db:"created_at"`
}

type BorrowingQueueItem struct {
	Id string `json:"id" db:"id"`
	BookId string `json:"bookId" db:"book_id"`
	AccountId string `json:"accountId" db:"account_id"`
	Book BookJSON `json:"book" db:"book"`
	Client         AccountJSON     `json:"client" db:"client"`
	CreatedAt db.NullableTime `json:"createdAt" db:"created_at"`
}