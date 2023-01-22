package model

type Author struct {
	Id         int    `json:"id" db:"id"`
	GivenName  string `json:"givenName" db:"given_name"`
	MiddleName string `json:"middleName" db:"middle_name"`
	Surname    string `json:"surname" db:"surname"`
	// DeletedAt  NullableTime `json:"_" db:"deleted_at"`
	// CreatedAt  NullableTime `json:"_" db:"created_at"`
}
