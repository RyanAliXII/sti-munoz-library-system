package model

import "github.com/RyanAliXII/sti-munoz-library-system/server/app/db"




type ClientLog struct {
	Id string `json:"id" db:"id"`
	Client AccountJSON `json:"client" db:"client"`
	Scanner ScannerAccountJSON `json:"scanner" db:"scanner"`
	CreatedAt db.NullableTime `json:"createdAt" db:"created_at"`
}