package model

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	validation "github.com/go-ozzo/ozzo-validation"
)


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
	IsEbook bool `json:"isEbook" db:"is_ebook"`
	Client         AccountJSON     `json:"client" db:"client"`
	CreatedAt db.NullableTime `json:"createdAt" db:"created_at"`
}

func (d * BorrowedBook)GetReadableDate() string{
	layout := "January 02, 2006 03:04 PM"
	return d.CreatedAt.Format(layout)
}

type BorrowedEBook struct {
	Id string `json:"id" db:"id"`
	Book BookJSON `json:"book" db:"book"`
	BookId string `json:"bookId" db:"book_id"`
	GroupId string `json:"groupId" db:"group_id"`
	Status string `json:"status" db:"status"`
	StatusId int `json:"statusId" db:"status_id"`
	AccountId string `json:"accountId" db:"account_id"`
	IsEbook bool `json:"isEbook" db:"is_ebook"`
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

type BookStatus struct {
	IsAvailable bool `json:"isAvailable" db:"is_available"`
	IsAlreadyBorrowed bool `json:"isAlreadyBorrowed" db:"is_already_borrowed"`;
	IsAlreadyInBag bool `json:"isAlreadyInBag" db:"is_already_in_bag"`	
	IsInQueue bool `json:"isInQueue" db:"is_in_queue"`
}

type ReturnBook struct {
	Remarks string `json:"remarks"`
	HasAdditionaPenalty bool `json:"hasAdditionalPenalty"`
	PenaltyDescription string `json:"penaltyDescription"`
	PenaltyAmount float64 `json:"penaltyAmount"`
}

type BorrowedBookExport struct {
	Book string `db:"book" csv:"book"`
	CopyNumber int `db:"copy_number" csv:"copy_number"`
	AccessionNumber int `db:"accession_number" csv:"accession_number"`
	IsEbook bool `db:"is_ebook" csv:"is_ebook"`
	Patron string `db:"patron" csv:"patron"`
	Email string `db:"email" csv:"email"`
	UserType string `db:"user_type" csv:"user_type"`
	Program string `db:"program_code" csv:"program_code"`
	DueDate *string `db:"due_date" csv:"due_date"`
	Status string `db:"status" csv:"status"`
	Penalty string `db:"penalty" csv:"penalty"`
}

func (m * ReturnBook)Validate() (validation.Errors, error){
	fieldRules := make([]*validation.FieldRules,0)
	if(m.HasAdditionaPenalty){
		fieldRules = append(fieldRules, validation.Field(&m.PenaltyDescription, validation.Required.Error("Description is required.")))
		fieldRules = append(fieldRules, validation.Field(&m.PenaltyAmount, validation.Required.Error("Amount is required."), validation.Min(float64(0)).Error("Amount cannot be less than or equal 0")))
	}
	err := validation.ValidateStruct(m, fieldRules...)
	if err != nil {
		validationErrors, isValidationErr := err.(validation.Errors)
		if isValidationErr {
			return validationErrors, err
		}
	}
	return validation.Errors{}, nil
}

