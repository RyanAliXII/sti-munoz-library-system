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

type PenaltyExport struct {
	ReferenceNumber string ` db:"reference_number" csv:"reference_number"`
	Name string `db:"name" csv:"patron"`
	StudentNumber string `db:"student_number" csv:"student_number"`
	ProgramCode string `db:"program_code" csv:"program_code"`
	UserType string `db:"user_type" csv:"user_type"`
	Description string ` db:"description" csv:"description"`
	Amount float64 ` db:"amount" csv:"amount"`
	Item string ` db:"item" csv:"item"`
	Remarks string ` db:"remarks" csv:"remarks"`
	CreatedAt db.NullableTime `db:"created_at" csv:"created_at"`
	IsSettled bool `db:"is_settled" csv:"is_settled"`
}