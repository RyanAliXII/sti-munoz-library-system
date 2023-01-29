package model

type Account struct {
	Id          string `json:"id" db:"id"`
	DisplayName string `json:"displayName" db:"display_name"`
	GivenName   string `json:"givenName" db:"given_name"`
	Surname     string `json:"surname" db:"surname"`
	Email       string `json:"email" db:"email"`
}
