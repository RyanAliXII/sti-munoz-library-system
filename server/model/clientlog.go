package model

import "github.com/RyanAliXII/sti-munoz-library-system/server/app/db"

type ClientLog struct {
	Id string `json:"id" db:"id"`
	Client AccountJSON `json:"client" db:"client"`
	Scanner ScannerAccountJSON `json:"scanner" db:"scanner"`
	CreatedAt db.NullableTime `json:"createdAt" db:"created_at"`
}

type ClientLogExport struct {
	Patron string `db:"patron" csv:"patron"`
	StudentNumber string `db:"student_number" csv:"student_number"`
	UserType string `db:"user_type" csv:"user_type"`
	Program string  `db:"program_code" csv:"program"`
	CreatedAt string `db:"created_at" csv:"created_at"`
}