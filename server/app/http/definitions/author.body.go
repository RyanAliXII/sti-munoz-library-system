package definitions

type NewAuthorBody struct {
	GivenName  string `json:"givenName" binding:"required" `
	MiddleName string `json:"middleName"`
	Surname    string `json:"surname" binding:"required" `
}
