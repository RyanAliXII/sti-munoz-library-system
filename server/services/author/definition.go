package author

type AuthorBody struct {
	Name string `json:"givenName" binding:"required,max=100,min=1"`
}
type OrganizationBody struct {
	Name string `json:"name" binding:"required,max=250,min=1"`
}
