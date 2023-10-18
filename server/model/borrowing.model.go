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
	CreatedAt db.NullableTime `json:"createdAt" db:"created_at"`
}

type BorrowedEBook struct {
	Id string `json:"id" db:"id"`
	Book BookJSON `json:"book" db:"book"`
	BookId string `json:"bookId" db:"book_id"`
	GroupId string `json:"groupId" db:"group_id"`
	Status string `json:"status" db:"status"`
	StatusId int `json:"statusId" db:"status_id"`
	AccountId string `json:"accountId" db:"account_id"`
	DueDate db.NullableDate  `json:"dueDate" db:"due_date"`
	Client         AccountJSON     `json:"client" db:"client"`
	CreatedAt db.NullableTime `json:"createdAt" db:"created_at"`
}




type BorrowingRequest struct {
	Id string `json:"id" db:"id"`
	AccountId string `json:"accountId" db:"account_id"`
	Client AccountJSON `json:"client" db:"client"`
	TotalPenalty float64 `json:"totalPenalty" db:"total_penalty"`
	TotalPending int `json:"totalPending" db:"total_pending"`
	TotalApproved int `json:"totalApproved" db:"total_approved"`
	TotalCheckedOut int `json:"totalCheckedOut" db:"total_checked_out"`
	TotalReturned int `json:"totalReturned" db:"total_returned"`
	TotalCancelled int `json:"totalCancelled" db:"total_cancelled"`
	TotalUnreturned int `json:"totalUnreturned" db:"total_unreturned"`
	CreatedAt  db.NullableTime `json:"createdAt" db:"created_at"`
}