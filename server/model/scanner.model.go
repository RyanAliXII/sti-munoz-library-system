package model


type ScannerAccount struct {
	Id string `json:"id" db:"id"`
	Username string `json:"username" db:"username"`
	Password string `json:"password" db:"password"`
	Description string `json:"description" db:"description"`
}