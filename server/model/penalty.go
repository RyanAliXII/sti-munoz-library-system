package model

import "github.com/RyanAliXII/sti-munoz-library-system/server/app/db"

type Penalty struct {
	Id string `json:"id" db:"id"`
	Description string `json:"description" db:"description"`
	Amount float64 `json:"amount" db:"amount"`
	Item string `json:"item" db:"item"`
	Remarks string `json:"remarks" db:"remarks"`
	ReferenceNumber string `json:"referenceNumber" db:"reference_number"`
	Proof string `json:"proof" db:"proof"`
	AccountId string `json:"accountId" db:"account_id"`
	Account         AccountJSON     `json:"account" db:"account"`
	CreatedAt db.NullableTime `json:"createdAt" db:"created_at"`
	SettledAt db.NullableTime `json:"settledAt" db:"settled_at"`
	ClassId string `json:"classId" db:"class_id"`
	Classification PenaltyClassificationJSON `json:"classification" db:"classification"`
	IsSettled bool `json:"isSettled" db:"is_settled"`
}