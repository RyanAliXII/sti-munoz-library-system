package authorsrc

type AuthorBody struct {
	GivenName  string `json:"givenName" binding:"required"`
	MiddleName string `json:"middleName"`
	Surname    string `json:"surname" binding:"required"`
}
