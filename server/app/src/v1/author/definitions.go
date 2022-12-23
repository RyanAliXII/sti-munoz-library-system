package authorsrc

type AuthorBody struct {
	GivenName  string `json:"givenName" binding:"required,max=100,min=1"`
	MiddleName string `json:"middleName" binding:"max=100"`
	Surname    string `json:"surname" binding:"required,max=100,min=1"`
}
