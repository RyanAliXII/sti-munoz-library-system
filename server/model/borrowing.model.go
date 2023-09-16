package model

import "github.com/RyanAliXII/sti-munoz-library-system/server/app/db"


type BorrowedBook struct {
	Id string `json:"id" db:"id"`
	AccessionId  string `json:"accessionId" db:"accession_id"`
	AccountId string `json:"accountId" db:"account_id"`
	AccessionNumber int `json:"accessionNumber" db:"number"`
	PenaltyOnPastDue int `json:"penaltyOnPastDue" db:"penalty_on_past_due"`
	CopyNumber int `json:"copyNumber" db:"copy_number"`
	Book BookJSON `json:"book" db:"book"`
	GroupId string `json:"groupId" db:"group_id"`
	Status string `json:"status" db:"status"`
	StatusId int `json:"statusId" db:"status_id"`
	Penalty float64 `json:"penalty" db:"penalty"`
	DueDate db.NullableDate  `json:"dueDate" db:"due_date"`
	Remarks string `json:"remarks" db:"remarks"`
	Client         AccountJSON     `json:"client" db:"client"`
}

